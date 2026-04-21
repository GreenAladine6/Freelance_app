from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from datetime import datetime
import os
import uuid
from bson.objectid import ObjectId
from werkzeug.utils import secure_filename
from models import User, Job, Application, Conversation, Message, Product, AdminLog, Report, ProfileUpdateLog, Notification, Review
from google.auth.transport import requests
from google.oauth2 import id_token

api = Blueprint('api', __name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads', 'profile_images')
CV_UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads', 'cvs')
ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.gif'}
ALLOWED_CV_EXTENSIONS = {'.pdf'}
DEFAULT_PROFILE_AVATAR = 'default.avif'


def _is_allowed_image(filename):
    _, ext = os.path.splitext(filename.lower())
    return ext in ALLOWED_IMAGE_EXTENSIONS


def _is_allowed_cv(filename):
    _, ext = os.path.splitext(filename.lower())
    return ext in ALLOWED_CV_EXTENSIONS


def _default_avatar_url():
    return f"{request.host_url.rstrip('/')}/api/uploads/profile-images/{DEFAULT_PROFILE_AVATAR}"


def _parse_bool_query_param(value, default=False):
    """Parse a truthy/falsy query parameter safely from string values."""
    if value is None:
        return default
    return str(value).strip().lower() in {'1', 'true', 'yes', 'on'}


def _notify_admins(notification_type, title, message, related_id=None, related_type=None, exclude_user_id=None):
    """Send a notification to all admin users."""
    admins_cursor = User.collection.find({'user_type': 'admin'}, {'_id': 1})
    excluded = str(exclude_user_id) if exclude_user_id else None

    for admin in admins_cursor:
        admin_id = str(admin.get('_id'))
        if excluded and admin_id == excluded:
            continue
        Notification.create(
            recipient_id=admin_id,
            notification_type=notification_type,
            title=title,
            message=message,
            related_id=related_id,
            related_type=related_type
        )


def _user_response(user_doc):
    payload = User.to_dict(user_doc)
    if payload and not payload.get('avatar_url'):
        payload['avatar_url'] = _default_avatar_url()
    return payload

# ==================== Authentication Routes ====================

@api.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['username', 'email', 'password', 'user_type']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    # Validate user_type
    # Note: we intentionally DO NOT allow public self-registration as admin.
    # Admin accounts should be created manually in the database.
    if data['user_type'] not in ['client', 'freelancer']:
        return jsonify({'error': 'user_type must be "client" or "freelancer"'}), 400
    
    # Check if username or email already exists
    if User.get_by_username(data['username']):
        return jsonify({'error': 'Username already exists'}), 409
    
    if User.get_by_email(data['email']):
        return jsonify({'error': 'Email already exists'}), 409
    
    # Create new user
    user_doc = User.create(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        user_type=data['user_type'],
        full_name=data.get('full_name'),
        bio=data.get('bio'),
        skills=data.get('skills'),
        hourly_rate=data.get('hourly_rate'),
        avatar_url=data.get('avatar_url') or _default_avatar_url(),
        education=data.get('education'),
        experience=data.get('experience'),
        portfolio=data.get('portfolio')
    )
    
    return jsonify({
        'message': 'User registered successfully',
        'user': _user_response(user_doc)
    }), 201


@api.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token."""
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    user_doc = User.get_by_email(data['email'])
    
    if not user_doc or not User.check_password(user_doc, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Ensure user_type exists and is one of supported roles
    user_type = user_doc.get('user_type')
    if user_type not in ['admin', 'client', 'freelancer']:
        return jsonify({'error': 'User has invalid role configuration'}), 500
    
    user_id = str(user_doc['_id'])
    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': User.to_dict(user_doc)
    }), 200


@api.route('/login-google', methods=['POST'])
def login_google():
    """Login with Google OAuth token."""
    import os
    from google.auth.transport import requests
    from google.oauth2 import id_token
    
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({'error': 'Google token is required'}), 400
    
    try:
        # Verify the token with Google
        GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com')
        print(f"[DEBUG] Using Google Client ID: {GOOGLE_CLIENT_ID}")
        print(f"[DEBUG] Token received: {token[:50]}...")
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        
        # Extract user info from token
        email = idinfo.get('email')
        google_id = idinfo.get('sub')
        full_name = idinfo.get('name', '')
        picture = idinfo.get('picture', '')
        
        if not email:
            return jsonify({'error': 'Email not found in Google token'}), 400
        
        # Check if user exists
        user_doc = User.get_by_email(email)
        
        if user_doc:
            # User exists, log them in
            user_id = str(user_doc['_id'])
        else:
            # Create new user from Google info
            # Default to 'freelancer' for new Google users
            user_doc = User.create(
                username=email.split('@')[0],  # Use email prefix as username
                email=email,
                password=None,  # Google users don't have password
                user_type='freelancer',
                full_name=full_name,
                avatar_url=picture or _default_avatar_url()
            )
            user_id = str(user_doc['_id'])
        
        # Generate JWT tokens
        access_token = create_access_token(identity=user_id)
        refresh_token = create_refresh_token(identity=user_id)
        
        return jsonify({
            'message': 'Google login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': _user_response(user_doc),
            'is_new_user': not user_doc or user_doc.get('user_type') is None
        }), 200
    
    except Exception as e:
        print(f"[ERROR] Google authentication failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Google authentication failed: {str(e)}'}), 401


@api.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token."""
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=current_user_id)
    
    return jsonify({
        'access_token': access_token
    }), 200


@api.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user profile."""
    current_user_id = get_jwt_identity()
    user_doc = User.get_by_id(current_user_id)
    
    if not user_doc:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(_user_response(user_doc)), 200


@api.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    """Update current user profile."""
    current_user_id = get_jwt_identity()
    user_doc = User.get_by_id(current_user_id)
    
    if not user_doc:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    update_data = {}
    if 'full_name' in data:
        update_data['full_name'] = data['full_name']
    if 'bio' in data:
        update_data['bio'] = data['bio']
    if 'skills' in data:
        update_data['skills'] = data['skills']
    if 'hourly_rate' in data:
        update_data['hourly_rate'] = data['hourly_rate']
    if 'avatar_url' in data:
        update_data['avatar_url'] = data['avatar_url']
    if 'education' in data:
        update_data['education'] = data['education']
    if 'experience' in data:
        update_data['experience'] = data['experience']
    if 'portfolio' in data:
        update_data['portfolio'] = data['portfolio']
    if 'is_available_for_hire' in data:
        if user_doc.get('user_type') != 'freelancer':
            return jsonify({'error': 'Only freelancers can update availability status'}), 403
        update_data['is_available_for_hire'] = bool(data['is_available_for_hire'])
    
    if update_data:
        update_data['updated_at'] = datetime.utcnow()
        User.collection.update_one({'_id': ObjectId(current_user_id)}, {'$set': update_data})
        changed_fields = [k for k in update_data.keys() if k != 'updated_at']
        if changed_fields:
            ProfileUpdateLog.create(current_user_id, changed_fields)
        
    if 'password' in data:
        User.set_password(current_user_id, data['password'])
        
    updated_user = User.get_by_id(current_user_id)
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': _user_response(updated_user)
    }), 200


@api.route('/me/avatar', methods=['POST'])
@jwt_required()
def upload_profile_avatar():
    """Upload current user avatar image."""
    current_user_id = get_jwt_identity()
    user_doc = User.get_by_id(current_user_id)

    if not user_doc:
        return jsonify({'error': 'User not found'}), 404

    if 'image' not in request.files:
        return jsonify({'error': 'Image file is required'}), 400

    image_file = request.files['image']
    if not image_file or not image_file.filename:
        return jsonify({'error': 'Image file is required'}), 400

    if not _is_allowed_image(image_file.filename):
        return jsonify({'error': 'Invalid image format'}), 400

    os.makedirs(PROFILE_UPLOAD_DIR, exist_ok=True)

    _, ext = os.path.splitext(secure_filename(image_file.filename))
    filename = f"{current_user_id}_{uuid.uuid4().hex}{ext.lower()}"
    filepath = os.path.join(PROFILE_UPLOAD_DIR, filename)
    image_file.save(filepath)

    avatar_url = f"{request.host_url.rstrip('/')}/api/uploads/profile-images/{filename}"

    User.collection.update_one(
        {'_id': ObjectId(current_user_id)},
        {'$set': {'avatar_url': avatar_url, 'updated_at': datetime.utcnow()}}
    )
    ProfileUpdateLog.create(current_user_id, ['avatar_url'])

    updated_user = User.get_by_id(current_user_id)
    return jsonify({
        'message': 'Avatar uploaded successfully',
        'avatar_url': avatar_url,
        'user': _user_response(updated_user)
    }), 200


@api.route('/me/cv', methods=['POST'])
@jwt_required()
def upload_profile_cv():
    """Upload current freelancer CV (PDF only)."""
    current_user_id = get_jwt_identity()
    user_doc = User.get_by_id(current_user_id)

    if not user_doc:
        return jsonify({'error': 'User not found'}), 404

    if user_doc.get('user_type') != 'freelancer':
        return jsonify({'error': 'Only freelancers can upload a CV'}), 403

    if 'cv' not in request.files:
        return jsonify({'error': 'CV file is required'}), 400

    cv_file = request.files['cv']
    if not cv_file or not cv_file.filename:
        return jsonify({'error': 'CV file is required'}), 400

    if not _is_allowed_cv(cv_file.filename):
        return jsonify({'error': 'Only PDF files are allowed'}), 400

    os.makedirs(CV_UPLOAD_DIR, exist_ok=True)

    filename = f"{current_user_id}_{uuid.uuid4().hex}.pdf"
    filepath = os.path.join(CV_UPLOAD_DIR, filename)
    cv_file.save(filepath)

    cv_url = f"{request.host_url.rstrip('/')}/api/uploads/cvs/{filename}"

    User.collection.update_one(
        {'_id': ObjectId(current_user_id)},
        {'$set': {'cv_url': cv_url, 'updated_at': datetime.utcnow()}}
    )
    ProfileUpdateLog.create(current_user_id, ['cv_url'])

    updated_user = User.get_by_id(current_user_id)
    return jsonify({
        'message': 'CV uploaded successfully',
        'cv_url': cv_url,
        'user': _user_response(updated_user)
    }), 200


@api.route('/uploads/profile-images/<path:filename>', methods=['GET'])
def get_profile_image(filename):
    """Serve uploaded profile images."""
    os.makedirs(PROFILE_UPLOAD_DIR, exist_ok=True)
    return send_from_directory(PROFILE_UPLOAD_DIR, filename)


@api.route('/uploads/cvs/<path:filename>', methods=['GET'])
def get_uploaded_cv(filename):
    """Serve uploaded freelancer CV files (PDF only)."""
    if not _is_allowed_cv(filename):
        return jsonify({'error': 'File not found'}), 404

    os.makedirs(CV_UPLOAD_DIR, exist_ok=True)
    return send_from_directory(CV_UPLOAD_DIR, filename, mimetype='application/pdf')


# ==================== Job Routes ====================

@api.route('/jobs', methods=['GET'])
def get_jobs():
    """Get all open jobs (public route)."""
    status = request.args.get('status', 'open')
    skills = request.args.get('skills')
    
    query = {'is_approved': True}
    if status:
        query['status'] = status
        
    if skills:
        # Simple case-insensitive regex match for skills
        query['skills_required'] = {'$regex': skills, '$options': 'i'}
        
    jobs_cursor = Job.collection.find(query).sort('created_at', -1)
    
    return jsonify([Job.to_dict(job) for job in jobs_cursor]), 200


@api.route('/jobs/<job_id>', methods=['GET'])
def get_job(job_id):
    """Get a specific job by ID."""
    job_doc = Job.get_by_id(job_id)
    
    if not job_doc:
        return jsonify({'error': 'Job not found'}), 404
    
    return jsonify(Job.to_dict(job_doc)), 200


@api.route('/jobs', methods=['POST'])
@jwt_required()
def create_job():
    """Create a new job (client only)."""
    current_user_id = get_jwt_identity()
    user_doc = User.get_by_id(current_user_id)
    
    if not user_doc or user_doc.get('user_type') != 'client':
        return jsonify({'error': 'Only clients can post jobs'}), 403
    
    data = request.get_json()
    
    required_fields = ['title', 'description', 'budget']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    job_doc = {
        'title': data['title'],
        'description': data['description'],
        'budget': data['budget'],
        'duration': data.get('duration'),
        'skills_required': data.get('skills_required'),
        'image_url': data.get('image_url'),
        'client_id': ObjectId(current_user_id),
        'status': 'open',
        'is_approved': False,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    res = Job.collection.insert_one(job_doc)
    new_job = Job.get_by_id(res.inserted_id)

    client_name = user_doc.get('full_name') or user_doc.get('username') or 'Client'
    _notify_admins(
        notification_type='job_pending_approval',
        title='Job Approval Needed',
        message=f'New job "{job_doc["title"]}" from {client_name} awaits approval',
        related_id=str(res.inserted_id),
        related_type='job'
    )
    
    return jsonify({
        'message': 'Job posted successfully and is pending admin approval',
        'job': Job.to_dict(new_job)
    }), 201


@api.route('/jobs/<job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    """Update a job (client only, own jobs)."""
    current_user_id = get_jwt_identity()
    job_doc = Job.get_by_id(job_id)
    
    if not job_doc:
        return jsonify({'error': 'Job not found'}), 404
    
    if str(job_doc.get('client_id')) != current_user_id:
        return jsonify({'error': 'You can only update your own jobs'}), 403
    
    data = request.get_json()
    update_data = {}
    
    for field in ['title', 'description', 'budget', 'duration', 'skills_required', 'status']:
        if field in data:
            update_data[field] = data[field]
            
    if update_data:
        update_data['updated_at'] = datetime.utcnow()
        Job.collection.update_one({'_id': ObjectId(job_id)}, {'$set': update_data})
        
    updated_job = Job.get_by_id(job_id)
    
    return jsonify({
        'message': 'Job updated successfully',
        'job': Job.to_dict(updated_job)
    }), 200


@api.route('/jobs/<job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    """Delete a job (client only, own jobs)."""
    current_user_id = get_jwt_identity()
    job_doc = Job.get_by_id(job_id)
    
    if not job_doc:
        return jsonify({'error': 'Job not found'}), 404
    
    if str(job_doc.get('client_id')) != current_user_id:
        return jsonify({'error': 'You can only delete your own jobs'}), 403
    
    Job.collection.delete_one({'_id': ObjectId(job_id)})
    Application.collection.delete_many({'job_id': ObjectId(job_id)})
    
    # Log the action (if user is admin)
    user_doc = User.get_by_id(current_user_id)
    if user_doc and user_doc.get('user_type') == 'admin':
        AdminLog.create(current_user_id, f"Deleted Job #{job_id}", details=f"Job title: {job_doc.get('title')}")
    
    return jsonify({'message': 'Job deleted successfully'}), 200


@api.route('/my-jobs', methods=['GET'])
@jwt_required()
def get_my_jobs():
    """Get jobs posted by current user (client)."""
    current_user_id = get_jwt_identity()
    
    jobs_cursor = Job.collection.find({'client_id': ObjectId(current_user_id)}).sort('created_at', -1)
    
    return jsonify([Job.to_dict(job) for job in jobs_cursor]), 200


# ==================== Application Routes ====================

@api.route('/jobs/<job_id>/apply', methods=['POST'])
@jwt_required()
def apply_for_job(job_id):
    """Apply for a job (freelancer only)."""
    current_user_id = get_jwt_identity()
    user_doc = User.get_by_id(current_user_id)
    
    if not user_doc or user_doc.get('user_type') != 'freelancer':
        return jsonify({'error': 'Only freelancers can apply for jobs'}), 403
    
    job_doc = Job.get_by_id(job_id)
    
    if not job_doc:
        return jsonify({'error': 'Job not found'}), 404
    
    if job_doc.get('status') != 'open':
        return jsonify({'error': 'This job is no longer accepting applications'}), 400
    
    # Check if already applied
    existing_application = Application.collection.find_one({
        'job_id': ObjectId(job_id),
        'freelancer_id': ObjectId(current_user_id)
    })
    
    if existing_application:
        return jsonify({'error': 'You have already applied for this job'}), 409
    
    data = request.get_json()
    
    if not data.get('cover_letter'):
        return jsonify({'error': 'Cover letter is required'}), 400
    
    app_doc = {
        'job_id': ObjectId(job_id),
        'freelancer_id': ObjectId(current_user_id),
        'cover_letter': data['cover_letter'],
        'proposed_rate': data.get('proposed_rate'),
        'status': 'pending',
        'created_at': datetime.utcnow()
    }
    
    res = Application.collection.insert_one(app_doc)
    new_app = Application.get_by_id(res.inserted_id)
    
    # Create notification for client
    client_id = job_doc.get('client_id')
    freelancer_name = user_doc.get('full_name') or user_doc.get('username')
    job_title = job_doc.get('title')
    
    Notification.create(
        recipient_id=str(client_id),
        notification_type='job_application',
        title='New Job Application',
        message=f'{freelancer_name} applied for your job: {job_title}',
        related_id=str(res.inserted_id),
        related_type='application'
    )
    
    return jsonify({
        'message': 'Application submitted successfully',
        'application': Application.to_dict(new_app)
    }), 201


@api.route('/jobs/<job_id>/applications', methods=['GET'])
@jwt_required()
def get_job_applications(job_id):
    """Get all applications for a job (client only, own jobs)."""
    current_user_id = get_jwt_identity()
    job_doc = Job.get_by_id(job_id)
    
    if not job_doc:
        return jsonify({'error': 'Job not found'}), 404
    
    if str(job_doc.get('client_id')) != current_user_id:
        return jsonify({'error': 'You can only view applications for your own jobs'}), 403
    
    apps_cursor = Application.collection.find({'job_id': ObjectId(job_id)}).sort('created_at', -1)
    
    return jsonify([Application.to_dict(app) for app in apps_cursor]), 200


@api.route('/applications/<application_id>/accept', methods=['POST'])
@jwt_required()
def accept_application(application_id):
    """Accept an application (client only)."""
    current_user_id = get_jwt_identity()
    app_doc = Application.get_by_id(application_id)
    
    if not app_doc:
        return jsonify({'error': 'Application not found'}), 404
        
    job_doc = Job.get_by_id(app_doc.get('job_id'))
    
    if str(job_doc.get('client_id')) != current_user_id:
        return jsonify({'error': 'You can only accept applications for your own jobs'}), 403
    
    # Update application status
    Application.collection.update_one({'_id': ObjectId(application_id)}, {'$set': {'status': 'accepted'}})
    
    # Update job status
    Job.collection.update_one({'_id': job_doc['_id']}, {'$set': {'status': 'in_progress', 'updated_at': datetime.utcnow()}})

    # Notify freelancer about decision
    freelancer_id = app_doc.get('freelancer_id')
    client_doc = User.get_by_id(current_user_id)
    client_name = (client_doc.get('full_name') or client_doc.get('username')) if client_doc else 'Client'
    job_title = job_doc.get('title') if job_doc else 'a job'
    acceptance_message = f'{client_name} accepted your application for: {job_title}'
    Notification.create(
        recipient_id=str(freelancer_id),
        notification_type='application_accepted',
        title='Application Accepted',
        message=acceptance_message,
        related_id=str(app_doc.get('_id')),
        related_type='application'
    )

    # Open conversation and seed it with the acceptance message
    conversation = Conversation.get_or_create(current_user_id, str(freelancer_id))
    Message.collection.insert_one({
        'conversation_id': conversation.get('_id'),
        'sender_id': ObjectId(current_user_id),
        'text': acceptance_message,
        'is_read': False,
        'created_at': datetime.utcnow()
    })
    Conversation.collection.update_one(
        {'_id': conversation.get('_id')},
        {'$set': {'last_message_at': datetime.utcnow()}}
    )

    # Extra notification to direct freelancer to the new conversation
    Notification.create(
        recipient_id=str(freelancer_id),
        notification_type='conversation_started',
        title='Conversation Started',
        message=f'A conversation with {client_name} has been opened for {job_title}',
        related_id=str(conversation.get('_id')),
        related_type='conversation'
    )
    
    updated_app = Application.get_by_id(application_id)
    
    return jsonify({
        'message': 'Application accepted successfully',
        'application': Application.to_dict(updated_app)
    }), 200


@api.route('/applications/<application_id>/reject', methods=['POST'])
@jwt_required()
def reject_application(application_id):
    """Reject an application (client only)."""
    current_user_id = get_jwt_identity()
    app_doc = Application.get_by_id(application_id)
    
    if not app_doc:
        return jsonify({'error': 'Application not found'}), 404
        
    job_doc = Job.get_by_id(app_doc.get('job_id'))
    
    if str(job_doc.get('client_id')) != current_user_id:
        return jsonify({'error': 'You can only reject applications for your own jobs'}), 403
    
    Application.collection.update_one({'_id': ObjectId(application_id)}, {'$set': {'status': 'rejected'}})

    # Notify freelancer about decision
    freelancer_id = app_doc.get('freelancer_id')
    client_doc = User.get_by_id(current_user_id)
    client_name = (client_doc.get('full_name') or client_doc.get('username')) if client_doc else 'Client'
    job_title = job_doc.get('title') if job_doc else 'a job'
    Notification.create(
        recipient_id=str(freelancer_id),
        notification_type='application_rejected',
        title='Application Update',
        message=f'{client_name} declined your application for: {job_title}',
        related_id=str(app_doc.get('_id')),
        related_type='application'
    )
    
    updated_app = Application.get_by_id(application_id)
    
    return jsonify({
        'message': 'Application rejected successfully',
        'application': Application.to_dict(updated_app)
    }), 200


@api.route('/my-applications', methods=['GET'])
@jwt_required()
def get_my_applications():
    """Get current user's applications (freelancer)."""
    current_user_id = get_jwt_identity()
    
    apps_cursor = Application.collection.find({'freelancer_id': ObjectId(current_user_id)}).sort('created_at', -1)
    
    return jsonify([Application.to_dict(app) for app in apps_cursor]), 200


# ==================== Notification Routes ====================

@api.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get notifications for current user (client)."""
    current_user_id = get_jwt_identity()

    try:
        recipient_object_id = ObjectId(current_user_id)
    except Exception:
        return jsonify({'error': 'Invalid user identity'}), 400
    
    # Query parameters for pagination
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    unread_only = _parse_bool_query_param(request.args.get('unread_only'))

    if page < 1:
        page = 1
    if limit < 1:
        limit = 20
    if limit > 100:
        limit = 100
    
    skip = (page - 1) * limit
    
    query = {'recipient_id': recipient_object_id}
    if unread_only:
        query['is_read'] = False
    
    notifications = list(
        Notification.collection.find(query)
        .sort('created_at', -1)
        .skip(skip)
        .limit(limit)
    )
    
    total_count = Notification.collection.count_documents(query)
    unread_count = Notification.collection.count_documents({
        'recipient_id': recipient_object_id,
        'is_read': False
    })
    
    return jsonify({
        'notifications': [Notification.to_dict(notif) for notif in notifications],
        'total_count': total_count,
        'unread_count': unread_count,
        'page': page,
        'limit': limit
    }), 200


@api.route('/notifications/<notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark a notification as read."""
    current_user_id = get_jwt_identity()
    
    notif_doc = Notification.get_by_id(notification_id)
    
    if not notif_doc:
        return jsonify({'error': 'Notification not found'}), 404
    
    if str(notif_doc.get('recipient_id')) != current_user_id:
        return jsonify({'error': 'Cannot mark other user notifications as read'}), 403
    
    Notification.mark_as_read(notification_id)
    updated_notif = Notification.get_by_id(notification_id)
    
    return jsonify({
        'message': 'Notification marked as read',
        'notification': Notification.to_dict(updated_notif)
    }), 200


@api.route('/notifications/read-all', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    """Mark all notifications as read for current user."""
    current_user_id = get_jwt_identity()

    try:
        recipient_object_id = ObjectId(current_user_id)
    except Exception:
        return jsonify({'error': 'Invalid user identity'}), 400
    
    Notification.mark_all_as_read(current_user_id)
    
    unread_count = Notification.collection.count_documents({
        'recipient_id': recipient_object_id,
        'is_read': False
    })
    
    return jsonify({
        'message': 'All notifications marked as read',
        'unread_count': unread_count
    }), 200


@api.route('/notifications/unread-count', methods=['GET'])
@jwt_required()
def get_unread_notification_count():
    """Get count of unread notifications for current user."""
    current_user_id = get_jwt_identity()

    try:
        recipient_object_id = ObjectId(current_user_id)
    except Exception:
        return jsonify({'error': 'Invalid user identity'}), 400
    
    unread_count = Notification.collection.count_documents({
        'recipient_id': recipient_object_id,
        'is_read': False
    })
    
    return jsonify({
        'unread_count': unread_count
    }), 200


# ==================== User Routes ====================

@api.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get a user profile by ID."""
    user_doc = User.get_by_id(user_id)
    
    if not user_doc:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(_user_response(user_doc)), 200


@api.route('/freelancers', methods=['GET'])
def get_freelancers():
    """Get all freelancers (public route)."""
    skills = request.args.get('skills')
    
    query = {'user_type': 'freelancer'}
    
    if skills:
        query['skills'] = {'$regex': skills, '$options': 'i'}
    
    freelancers_cursor = User.collection.find(query).sort('created_at', -1)
    
    return jsonify([_user_response(f) for f in freelancers_cursor]), 200


# ==================== Admin Routes ====================

@api.route('/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    """Get platform-wide statistics (admin only)."""
    current_user_id = get_jwt_identity()
    user_doc = User.get_by_id(current_user_id)
    if not user_doc or user_doc.get('user_type') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    total_users = User.collection.count_documents({})
    freelancers = User.collection.count_documents({'user_type': 'freelancer'})
    clients = User.collection.count_documents({'user_type': 'client'})
    open_jobs = Job.collection.count_documents({'status': 'open'})
    total_jobs = Job.collection.count_documents({})
    total_applications = Application.collection.count_documents({})
    pending_applications = Application.collection.count_documents({'status': 'pending'})

    return jsonify({
        'total_users': total_users,
        'freelancers': freelancers,
        'clients': clients,
        'open_jobs': open_jobs,
        'total_jobs': total_jobs,
        'total_applications': total_applications,
        'pending_applications': pending_applications,
    }), 200


@api.route('/admin/logs', methods=['GET'])
@jwt_required()
def get_admin_logs():
    """Get recent admin logs (admin only)."""
    current_user_id = get_jwt_identity()
    user_doc = User.get_by_id(current_user_id)
    if not user_doc or user_doc.get('user_type') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    logs_cursor = AdminLog.collection.find().sort('created_at', -1).limit(20)
    return jsonify([AdminLog.to_dict(log) for log in logs_cursor]), 200


@api.route('/admin/reports', methods=['GET'])
@jwt_required()
def get_admin_reports():
    """Get pending reports (admin only)."""
    current_user_id = get_jwt_identity()
    user_doc = User.get_by_id(current_user_id)
    if not user_doc or user_doc.get('user_type') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    reports_cursor = Report.collection.find({'status': 'pending'}).sort('created_at', -1)
    return jsonify([Report.to_dict(report) for report in reports_cursor]), 200


@api.route('/admin/reports/<report_id>', methods=['PUT'])
@jwt_required()
def update_report_status(report_id):
    """Update report status (admin only)."""
    current_user_id = get_jwt_identity()
    user_doc = User.get_by_id(current_user_id)
    if not user_doc or user_doc.get('user_type') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json()
    status = data.get('status')
    if status not in ['resolved', 'dismissed']:
        return jsonify({'error': 'Invalid status'}), 400

    report_doc = Report.collection.find_one({'_id': ObjectId(report_id)})
    if not report_doc:
        return jsonify({'error': 'Report not found'}), 404

    Report.collection.update_one({'_id': ObjectId(report_id)}, {'$set': {'status': status}})
    AdminLog.create(current_user_id, f"Report {status}", details=f"Report ID: {report_id}")

    reporter_id = report_doc.get('reporter_id')
    if reporter_id and str(reporter_id) != current_user_id:
        Notification.create(
            recipient_id=str(reporter_id),
            notification_type='report_update',
            title='Report Updated',
            message=f'Your report has been marked as {status}',
            related_id=report_id,
            related_type='report'
        )
    
    return jsonify({'message': f'Report {status} successfully'}), 200


@api.route('/admin/pending', methods=['GET'])
@jwt_required()
def get_pending_content():
    """Get all unapproved jobs and products (admin only)."""
    current_user_id = get_jwt_identity()
    user_doc = User.get_by_id(current_user_id)
    if not user_doc or user_doc.get('user_type') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    pending_jobs = Job.collection.find({'is_approved': False})
    pending_products = Product.collection.find({'is_approved': False})

    return jsonify({
        'jobs': [Job.to_dict(j) for j in pending_jobs],
        'products': [Product.to_dict(p) for p in pending_products]
    }), 200


@api.route('/admin/approve/<content_type>/<content_id>', methods=['PUT'])
@jwt_required()
def approve_content(content_type, content_id):
    """Approve a job or product (admin only)."""
    current_user_id = get_jwt_identity()
    user_doc = User.get_by_id(current_user_id)
    if not user_doc or user_doc.get('user_type') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    if content_type == 'job':
        content_doc = Job.get_by_id(content_id)
        if not content_doc:
            return jsonify({'error': 'Content not found or already approved'}), 404

        res = Job.collection.update_one({'_id': ObjectId(content_id)}, {'$set': {'is_approved': True}})
        action = "Approved Job"
        owner_id = content_doc.get('client_id')
        notification_type = 'job_approved'
        notification_title = 'Job Approved'
        notification_message = f'Your job "{content_doc.get("title") or "Untitled Job"}" is now live'
    elif content_type == 'product':
        content_doc = Product.collection.find_one({'_id': ObjectId(content_id)})
        if not content_doc:
            return jsonify({'error': 'Content not found or already approved'}), 404

        res = Product.collection.update_one({'_id': ObjectId(content_id)}, {'$set': {'is_approved': True}})
        action = "Approved Product"
        owner_id = content_doc.get('seller_id')
        notification_type = 'product_approved'
        notification_title = 'Product Approved'
        notification_message = f'Your product "{content_doc.get("name") or "Untitled Product"}" is now live'
    else:
        return jsonify({'error': 'Invalid content type'}), 400

    if res.modified_count:
        AdminLog.create(current_user_id, f"{action} #{content_id}")

        if owner_id and str(owner_id) != current_user_id:
            Notification.create(
                recipient_id=str(owner_id),
                notification_type=notification_type,
                title=notification_title,
                message=notification_message,
                related_id=content_id,
                related_type=content_type
            )

        return jsonify({'message': f'{content_type} approved successfully'}), 200
    
    return jsonify({'error': 'Content not found or already approved'}), 404


@api.route('/admin/analytics', methods=['GET'])
@jwt_required()
def get_admin_analytics():
    """Get platform analytics data (admin only)."""
    current_user_id = get_jwt_identity()
    user_doc = User.get_by_id(current_user_id)
    if not user_doc or user_doc.get('user_type') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    # Simple weekly user growth simulation
    # In a real app, this would be grouped by date from the DB
    analytics_data = {
        'user_growth': [10, 25, 40, 65, 90, 120, 150],
        'job_growth': [5, 12, 20, 35, 50, 75, 100],
        'revenue_projection': [100, 300, 700, 1500, 2500, 4000, 6000],
        'top_skills': [
            {'skill': 'React', 'count': 45},
            {'skill': 'Python', 'count': 38},
            {'skill': 'Design', 'count': 32}
        ]
    }
    return jsonify(analytics_data), 200


# ==================== Chat Routes ====================

@api.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    """Get all conversations for current user."""
    current_user_id = get_jwt_identity()
    convs = Conversation.collection.find({
        'participants': ObjectId(current_user_id)
    }).sort('last_message_at', -1)
    
    return jsonify([Conversation.to_dict(c, current_user_id) for c in convs]), 200


@api.route('/conversations/with/<user_id>', methods=['GET'])
@jwt_required()
def get_or_create_conversation_with_user(user_id):
    """Get or create a direct conversation with another user."""
    current_user_id = get_jwt_identity()

    if not User.get_by_id(user_id):
        return jsonify({'error': 'User not found'}), 404

    conv = Conversation.get_or_create(current_user_id, user_id)
    return jsonify(Conversation.to_dict(conv, current_user_id)), 200

@api.route('/conversations/<conversation_id>', methods=['GET'])
@jwt_required()
def get_conversation(conversation_id):
    """Get conversation details."""
    current_user_id = get_jwt_identity()
    conv = Conversation.collection.find_one({'_id': ObjectId(conversation_id)})
    if not conv or ObjectId(current_user_id) not in conv.get('participants', []):
        return jsonify({'error': 'Conversation not found or access denied'}), 404
    
    return jsonify(Conversation.to_dict(conv, current_user_id)), 200

@api.route('/conversations/<conversation_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(conversation_id):
    """Get messages for a specific conversation."""
    current_user_id = get_jwt_identity()
    # Verify participant
    conv = Conversation.collection.find_one({'_id': ObjectId(conversation_id)})
    if not conv or ObjectId(current_user_id) not in conv.get('participants', []):
        return jsonify({'error': 'Conversation not found or access denied'}), 404

    # Mark messages from the other participant as read when this conversation is opened.
    Message.collection.update_many(
        {
            'conversation_id': ObjectId(conversation_id),
            'sender_id': {'$ne': ObjectId(current_user_id)},
            'is_read': False
        },
        {'$set': {'is_read': True}}
    )
        
    msgs = Message.collection.find({
        'conversation_id': ObjectId(conversation_id)
    }).sort('created_at', 1)
    
    return jsonify([Message.to_dict(m) for m in msgs]), 200

@api.route('/messages', methods=['POST'])
@jwt_required()
def send_message():
    """Send a message (creates conversation if doesn't exist)."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    recipient_id = data.get('recipient_id')
    conversation_id = data.get('conversation_id')
    text = data.get('text')
    
    if not text:
        return jsonify({'error': 'Message text is required'}), 400
        
    if conversation_id:
        conv = Conversation.collection.find_one({'_id': ObjectId(conversation_id)})
        if not conv:
            return jsonify({'error': 'Conversation not found'}), 404

        if ObjectId(current_user_id) not in conv.get('participants', []):
            return jsonify({'error': 'Conversation not found or access denied'}), 404
    elif recipient_id:
        recipient_doc = User.get_by_id(recipient_id)
        if not recipient_doc:
            return jsonify({'error': 'Recipient not found'}), 404

        if recipient_id == current_user_id:
            return jsonify({'error': 'Cannot send a message to yourself'}), 400

        conv = Conversation.get_or_create(current_user_id, recipient_id)
    else:
        return jsonify({'error': 'Recipient or conversation ID required'}), 400
        
    msg_doc = {
        'conversation_id': conv['_id'],
        'sender_id': ObjectId(current_user_id),
        'text': text,
        'is_read': False,
        'created_at': datetime.utcnow()
    }
    
    res = Message.collection.insert_one(msg_doc)
    Conversation.collection.update_one(
        {'_id': conv['_id']},
        {'$set': {'last_message_at': datetime.utcnow()}}
    )

    recipient_notification_id = None
    if recipient_id and recipient_id != current_user_id:
        recipient_notification_id = recipient_id
    else:
        for participant in conv.get('participants', []):
            participant_id = str(participant)
            if participant_id != current_user_id:
                recipient_notification_id = participant_id
                break

    if recipient_notification_id:
        sender_doc = User.get_by_id(current_user_id)
        sender_name = (sender_doc.get('full_name') or sender_doc.get('username')) if sender_doc else 'Someone'
        Notification.create(
            recipient_id=recipient_notification_id,
            notification_type='message',
            title='New Message',
            message=f'{sender_name} sent you a message',
            related_id=str(conv['_id']),
            related_type='conversation'
        )
    
    return jsonify(Message.to_dict(Message.collection.find_one({'_id': res.inserted_id}))), 201

# ==================== Store Routes ====================

@api.route('/products', methods=['GET'])
def get_products():
    """Get all store products."""
    category = request.args.get('category')
    page = request.args.get('page', default=1, type=int)
    limit = request.args.get('limit', default=10, type=int)

    if page < 1:
        page = 1
    if limit < 1:
        limit = 10
    if limit > 50:
        limit = 50

    query = {'is_approved': True}
    if category:
        query['category'] = category
        
    products = Product.collection.find(query).sort('created_at', -1).skip((page - 1) * limit).limit(limit)
    return jsonify([Product.to_dict(p) for p in products]), 200

@api.route('/products', methods=['POST'])
@jwt_required()
def add_product():
    """Add a product to the store (admin/top freelancers)."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    product_doc = {
        'name': data.get('name'),
        'description': data.get('description'),
        'price': data.get('price'),
        'image_url': data.get('image_url'),
        'category': data.get('category'),
        'seller_id': ObjectId(current_user_id),
        'is_approved': False,
        'created_at': datetime.utcnow()
    }
    
    res = Product.collection.insert_one(product_doc)

    creator_doc = User.get_by_id(current_user_id)
    creator_name = (creator_doc.get('full_name') or creator_doc.get('username')) if creator_doc else 'User'
    _notify_admins(
        notification_type='product_pending_approval',
        title='Product Approval Needed',
        message=f'New product "{product_doc.get("name") or "Untitled Product"}" from {creator_name} awaits approval',
        related_id=str(res.inserted_id),
        related_type='product',
        exclude_user_id=current_user_id
    )

    return jsonify({
        'message': 'Product added and is pending admin approval',
        'product': Product.to_dict(Product.collection.find_one({'_id': res.inserted_id}))
    }), 201

@api.route('/products/purchase', methods=['POST'])
@jwt_required(optional=True)
def purchase_products():
    """Simulate purchasing products and notify sellers."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    product_ids = data.get('product_ids', [])
    buyer_name = data.get('buyer_name', 'A client')

    if current_user_id:
        buyer_doc = User.get_by_id(current_user_id)
        if buyer_doc:
            buyer_name = buyer_doc.get('full_name') or buyer_doc.get('username') or buyer_name

    purchased_items = []
    
    for pid in product_ids:
        try:
            prod = Product.collection.find_one({'_id': ObjectId(pid)})
            if prod and prod.get('seller_id'):
                seller_id = str(prod.get('seller_id'))
                # Notify the freelancer/seller
                Notification.create(
                    recipient_id=seller_id,
                    notification_type='service_purchased',
                    title='Service Purchased!',
                    message=f'{buyer_name} purchased your service: {prod.get("name")}',
                    related_id=pid,
                    related_type='product'
                )
                purchased_items.append(pid)
        except Exception:
            pass
            
    return jsonify({'message': 'Purchase successful', 'purchased_count': len(purchased_items)}), 200

# ==================== Review Routes ====================

@api.route('/users/<user_id>/reviews', methods=['POST'])
@jwt_required()
def add_review(user_id):
    """Add a review for a freelancer (client only)."""
    current_user_id = get_jwt_identity()
    user_doc = User.get_by_id(current_user_id)
    
    if not user_doc or user_doc.get('user_type') != 'client':
        return jsonify({'error': 'Only clients can leave reviews'}), 403

    freelancer = User.get_by_id(user_id)
    if not freelancer or freelancer.get('user_type') != 'freelancer':
        return jsonify({'error': 'Target user is not a valid freelancer'}), 404

    # Verify that the client has an accepted application for this freelancer OR an open conversation
    can_review = False
    
    client_job_docs = Job.collection.find({'client_id': ObjectId(current_user_id)}, {'_id': 1})
    client_job_ids = [job['_id'] for job in client_job_docs]
    if client_job_ids:
        accepted_app = Application.collection.find_one({
            'freelancer_id': ObjectId(user_id),
            'job_id': {'$in': client_job_ids},
            'status': 'accepted'
        })
        if accepted_app:
            can_review = True

    if not can_review:
        conv = Conversation.collection.find_one({
            'participants': {'$all': [ObjectId(current_user_id), ObjectId(user_id)]}
        })
        if conv:
            can_review = True

    if not can_review:
        return jsonify({'error': 'You can only review freelancers you have interacted with.'}), 403

    data = request.get_json()
    rating = data.get('rating')
    comment = data.get('comment', '')
    
    try:
        rating = int(rating)
        if rating < 1 or rating > 5:
            raise ValueError()
    except (TypeError, ValueError):
        return jsonify({'error': 'Valid rating between 1 and 5 is required'}), 400
        
    review_doc = Review.create(
        freelancer_id=user_id,
        reviewer_id=current_user_id,
        rating=rating,
        comment=comment
    )
    
    reviewer_name = user_doc.get('full_name') or user_doc.get('username') or 'A client'
    Notification.create(
        recipient_id=str(user_id),
        notification_type='new_review',
        title='New Review Received',
        message=f'{reviewer_name} left you a {rating}-star review.',
        related_id=str(review_doc.get('_id')),
        related_type='review'
    )
    
    return jsonify({
        'message': 'Review added successfully',
        'review': Review.to_dict(review_doc)
    }), 201


@api.route('/reviews/<review_id>', methods=['PUT'])
@jwt_required()
def edit_review(review_id):
    """Edit an existing review."""
    current_user_id = get_jwt_identity()
    user_doc = User.get_by_id(current_user_id)
    
    if not user_doc:
        return jsonify({'error': 'User not found'}), 404

    try:
        from bson import ObjectId
        review_doc = Review.collection.find_one({'_id': ObjectId(review_id)})
    except Exception:
        return jsonify({'error': 'Invalid review ID'}), 400

    if not review_doc:
        return jsonify({'error': 'Review not found'}), 404

    if str(review_doc.get('reviewer_id')) != str(current_user_id):
        return jsonify({'error': 'You can only edit your own reviews'}), 403

    data = request.get_json()
    rating = data.get('rating')
    comment = data.get('comment', '')

    if rating is not None:
        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                raise ValueError()
        except (TypeError, ValueError):
            return jsonify({'error': 'Valid rating between 1 and 5 is required'}), 400
    else:
        rating = review_doc.get('rating')

    updated_review = Review.update(review_id, rating, comment)
    return jsonify({
        'message': 'Review updated successfully',
        'review': Review.to_dict(updated_review)
    }), 200


@api.route('/users/<user_id>/reviews', methods=['GET'])
@jwt_required(optional=True)
def get_user_reviews(user_id):
    """Get all reviews for a freelancer and evaluate permissions."""
    current_user_id = get_jwt_identity()
    freelancer = User.get_by_id(user_id)
    if not freelancer:
        return jsonify({'error': 'Freelancer not found'}), 404
        
    reviews_cursor = Review.get_by_freelancer(user_id)
    reviews_list = [Review.to_dict(r) for r in reviews_cursor]
    
    can_review = False
    if current_user_id:
        user_doc = User.get_by_id(current_user_id)
        if user_doc and user_doc.get('user_type') == 'client':
            client_job_docs = Job.collection.find({'client_id': ObjectId(current_user_id)}, {'_id': 1})
            client_job_ids = [job['_id'] for job in client_job_docs]
            if client_job_ids:
                accepted_app = Application.collection.find_one({
                    'freelancer_id': ObjectId(user_id),
                    'job_id': {'$in': client_job_ids},
                    'status': 'accepted'
                })
                if accepted_app:
                    can_review = True
            
            if not can_review:
                conv = Conversation.collection.find_one({
                    'participants': {'$all': [ObjectId(current_user_id), ObjectId(user_id)]}
                })
                if conv:
                    can_review = True
                    
    return jsonify({
        'reviews': reviews_list,
        'can_review': can_review
    }), 200

# ==================== Health Check ====================

@api.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'message': 'Freelance API is running'}), 200
