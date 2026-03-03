from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from datetime import datetime
from bson.objectid import ObjectId
from models import User, Job, Application

api = Blueprint('api', __name__)

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
        hourly_rate=data.get('hourly_rate')
    )
    
    return jsonify({
        'message': 'User registered successfully',
        'user': User.to_dict(user_doc)
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
    
    return jsonify(User.to_dict(user_doc)), 200


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
    
    if update_data:
        User.collection.update_one({'_id': ObjectId(current_user_id)}, {'$set': update_data})
        
    if 'password' in data:
        User.set_password(current_user_id, data['password'])
        
    updated_user = User.get_by_id(current_user_id)
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': User.to_dict(updated_user)
    }), 200


# ==================== Job Routes ====================

@api.route('/jobs', methods=['GET'])
def get_jobs():
    """Get all open jobs (public route)."""
    status = request.args.get('status', 'open')
    skills = request.args.get('skills')
    
    query = {}
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
        'client_id': ObjectId(current_user_id),
        'status': 'open',
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    res = Job.collection.insert_one(job_doc)
    new_job = Job.get_by_id(res.inserted_id)
    
    return jsonify({
        'message': 'Job created successfully',
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


# ==================== User Routes ====================

@api.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get a user profile by ID."""
    user_doc = User.get_by_id(user_id)
    
    if not user_doc:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(User.to_dict(user_doc)), 200


@api.route('/freelancers', methods=['GET'])
def get_freelancers():
    """Get all freelancers (public route)."""
    skills = request.args.get('skills')
    
    query = {'user_type': 'freelancer'}
    
    if skills:
        query['skills'] = {'$regex': skills, '$options': 'i'}
    
    freelancers_cursor = User.collection.find(query).sort('created_at', -1)
    
    return jsonify([User.to_dict(f) for f in freelancers_cursor]), 200


# ==================== Health Check ====================

@api.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'message': 'Freelance API is running'}), 200
