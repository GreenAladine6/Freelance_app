from pymongo import MongoClient
import os
import certifi
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from bson.objectid import ObjectId
from config import Config

if '+srv' in Config.MONGO_URI:
    client = MongoClient(Config.MONGO_URI, tlsCAFile=certifi.where())
else:
    client = MongoClient(Config.MONGO_URI)
try:
    db = client.get_default_database()
except Exception:
    db = client['freelanceapp']

class User:
    collection = db.users

    @staticmethod
    def create(
        username,
        email,
        password,
        user_type,
        full_name=None,
        bio=None,
        skills=None,
        hourly_rate=None,
        avatar_url=None,
        cv_url=None,
        education=None,
        experience=None,
        portfolio=None,
        is_available_for_hire=None,
    ):
        password_hash = generate_password_hash(password) if password else None
        if is_available_for_hire is None:
            is_available_for_hire = user_type == 'freelancer'
        user_doc = {
            'username': username,
            'email': email,
            'password_hash': password_hash,
            'user_type': user_type,
            'full_name': full_name,
            'bio': bio,
            'skills': skills,
            'hourly_rate': hourly_rate,
            'avatar_url': avatar_url,
            'cv_url': cv_url,
            'education': education or [],
            'experience': experience or [],
            'portfolio': portfolio or [],
            'is_available_for_hire': is_available_for_hire,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        res = User.collection.insert_one(user_doc)
        return User.collection.find_one({"_id": res.inserted_id})

    @staticmethod
    def get_by_email(email):
        return User.collection.find_one({'email': email})

    @staticmethod
    def get_by_username(username):
        return User.collection.find_one({'username': username})

    @staticmethod
    def get_by_id(user_id):
        try:
            return User.collection.find_one({'_id': ObjectId(user_id)})
        except:
            return None

    @staticmethod
    def check_password(user_doc, password):
        if not user_doc.get('password_hash'):
            return False
        return check_password_hash(user_doc['password_hash'], password)

    @staticmethod
    def set_password(user_id, password):
        password_hash = generate_password_hash(password)
        User.collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"password_hash": password_hash}})

    @staticmethod
    def to_dict(user_doc):
        if not user_doc:
            return None
        is_freelancer = user_doc.get('user_type') == 'freelancer'
        return {
            'id': str(user_doc['_id']),
            'username': user_doc.get('username'),
            'email': user_doc.get('email'),
            'user_type': user_doc.get('user_type'),
            'full_name': user_doc.get('full_name'),
            'bio': user_doc.get('bio'),
            'skills': user_doc.get('skills'),
            'hourly_rate': user_doc.get('hourly_rate'),
            'avatar_url': user_doc.get('avatar_url'),
            'cv_url': user_doc.get('cv_url'),
            'education': user_doc.get('education', []),
            'experience': user_doc.get('experience', []),
            'portfolio': user_doc.get('portfolio', []),
            'is_available_for_hire': user_doc.get('is_available_for_hire', is_freelancer),
            'created_at': user_doc.get('created_at').isoformat() if hasattr(user_doc.get('created_at'), 'isoformat') else user_doc.get('created_at')
        }

class Conversation:
    collection = db.conversations

    @staticmethod
    def get_or_create(user1_id, user2_id):
        ids = sorted([str(user1_id), str(user2_id)])
        participants = [ObjectId(id) for id in ids]
        
        conv = Conversation.collection.find_one({
            'participants': {'$all': participants, '$size': 2}
        })
        
        if not conv:
            conv_doc = {
                'participants': participants,
                'created_at': datetime.utcnow(),
                'last_message_at': datetime.utcnow()
            }
            res = Conversation.collection.insert_one(conv_doc)
            return Conversation.collection.find_one({'_id': res.inserted_id})
        return conv

    @staticmethod
    def to_dict(doc, current_user_id=None):
        if not doc: return None
        participants_ids = [str(pid) for pid in doc.get('participants', [])]
        other_user_id = next((pid for pid in participants_ids if pid != str(current_user_id)), None)
        other_user = User.get_by_id(other_user_id) if other_user_id else None
        
        last_msg = Message.collection.find_one(
            {'conversation_id': doc['_id']},
            sort=[('created_at', -1)]
        )

        unread_count = 0
        if current_user_id:
            unread_count = Message.collection.count_documents({
                'conversation_id': doc['_id'],
                'sender_id': {'$ne': ObjectId(str(current_user_id))},
                'is_read': False
            })

        return {
            'id': str(doc['_id']),
            'last_message_at': doc.get('last_message_at').isoformat() if hasattr(doc.get('last_message_at'), 'isoformat') else None,
            'other_user': User.to_dict(other_user) if other_user else None,
            'last_message': Message.to_dict(last_msg) if last_msg else None,
            'unread_count': unread_count
        }

class Message:
    collection = db.messages

    @staticmethod
    def to_dict(doc):
        if not doc: return None
        return {
            'id': str(doc['_id']),
            'conversation_id': str(doc.get('conversation_id')),
            'sender_id': str(doc.get('sender_id')),
            'text': doc.get('text'),
            'is_read': doc.get('is_read', False),
            'created_at': doc.get('created_at').isoformat() if hasattr(doc.get('created_at'), 'isoformat') else None
        }

class Product:
    collection = db.products

    @staticmethod
    def to_dict(doc):
        if not doc: return None
        seller_id = doc.get('seller_id')
        seller = User.get_by_id(seller_id) if seller_id else None
        return {
            'id': str(doc['_id']),
            'name': doc.get('name'),
            'description': doc.get('description'),
            'price': doc.get('price'),
            'image_url': doc.get('image_url'),
            'category': doc.get('category'),
            'seller_id': str(seller_id),
            'seller_avatar_url': seller.get('avatar_url') if seller else None,
            'is_approved': doc.get('is_approved', False),
            'created_at': doc.get('created_at').isoformat() if hasattr(doc.get('created_at'), 'isoformat') else None
        }

class Application:
    collection = db.applications

    @staticmethod
    def get_by_id(app_id):
        try:
            return Application.collection.find_one({'_id': ObjectId(app_id)})
        except:
            return None

    @staticmethod
    def to_dict(app_doc):
        if not app_doc: return None
        freelancer_id = app_doc.get('freelancer_id')
        freelancer = User.get_by_id(freelancer_id) if freelancer_id else None
        return {
            'id': str(app_doc['_id']),
            'job_id': str(app_doc.get('job_id')),
            'freelancer_id': str(freelancer_id) if freelancer_id else None,
            'freelancer_name': freelancer.get('full_name') if freelancer else None,
            'cover_letter': app_doc.get('cover_letter'),
            'proposed_rate': app_doc.get('proposed_rate'),
            'status': app_doc.get('status', 'pending'),
            'created_at': app_doc.get('created_at').isoformat() if hasattr(app_doc.get('created_at'), 'isoformat') else None
        }

class Job:
    collection = db.jobs

    @staticmethod
    def get_by_id(job_id):
        try:
            return Job.collection.find_one({'_id': ObjectId(job_id)})
        except:
            return None

    @staticmethod
    def to_dict(job_doc):
        if not job_doc: return None
        client_id = job_doc.get('client_id')
        client = User.get_by_id(client_id) if client_id else None
        return {
            'id': str(job_doc['_id']),
            'title': job_doc.get('title'),
            'description': job_doc.get('description'),
            'budget': job_doc.get('budget'),
            'duration': job_doc.get('duration'),
            'skills_required': job_doc.get('skills_required'),
            'image_url': job_doc.get('image_url'),
            'client_id': str(client_id) if client_id else None,
            'client_name': (client.get('full_name') or client.get('username')) if client else None,
            'client_avatar_url': client.get('avatar_url') if client else None,
            'status': job_doc.get('status', 'open'),
            'is_approved': job_doc.get('is_approved', False),
            'created_at': job_doc.get('created_at').isoformat() if hasattr(job_doc.get('created_at'), 'isoformat') else None,
            'updated_at': job_doc.get('updated_at').isoformat() if hasattr(job_doc.get('updated_at'), 'isoformat') else None,
            'application_count': Application.collection.count_documents({'job_id': job_doc['_id']})
        }

class AdminLog:
    collection = db.admin_logs

    @staticmethod
    def create(admin_id, action, details=None):
        log_doc = {
            'admin_id': ObjectId(admin_id),
            'action': action,
            'details': details,
            'created_at': datetime.utcnow()
        }
        AdminLog.collection.insert_one(log_doc)

    @staticmethod
    def to_dict(doc):
        if not doc: return None
        return {
            'id': str(doc['_id']),
            'admin_id': str(doc.get('admin_id')),
            'action': doc.get('action'),
            'details': doc.get('details'),
            'created_at': doc.get('created_at').isoformat() if hasattr(doc.get('created_at'), 'isoformat') else None
        }

class Report:
    collection = db.reports

    @staticmethod
    def to_dict(doc):
        if not doc: return None
        return {
            'id': str(doc['_id']),
            'reporter_id': str(doc.get('reporter_id')),
            'reason': doc.get('reason'),
            'target_type': doc.get('target_type'),
            'target_id': str(doc.get('target_id')),
            'status': doc.get('status', 'pending'),
            'created_at': doc.get('created_at').isoformat() if hasattr(doc.get('created_at'), 'isoformat') else None
        }


class ProfileUpdateLog:
    collection = db.profile_update_logs

    @staticmethod
    def create(user_id, changed_fields):
        log_doc = {
            'user_id': ObjectId(user_id),
            'changed_fields': changed_fields,
            'created_at': datetime.utcnow()
        }
        ProfileUpdateLog.collection.insert_one(log_doc)

    @staticmethod
    def to_dict(doc):
        if not doc:
            return None
        return {
            'id': str(doc.get('_id')),
            'user_id': str(doc.get('user_id')) if doc.get('user_id') else None,
            'changed_fields': doc.get('changed_fields', []),
            'created_at': doc.get('created_at').isoformat() if hasattr(doc.get('created_at'), 'isoformat') else None
        }


class Notification:
    collection = db.notifications

    @staticmethod
    def create(recipient_id, notification_type, title, message, related_id=None, related_type=None):
        """Create a new notification for a user."""
        notif_doc = {
            'recipient_id': ObjectId(recipient_id),
            'notification_type': notification_type,  # e.g., 'job_application', 'message', etc.
            'title': title,
            'message': message,
            'related_id': ObjectId(related_id) if related_id else None,
            'related_type': related_type,  # e.g., 'application', 'job', 'user', etc.
            'is_read': False,
            'created_at': datetime.utcnow()
        }
        res = Notification.collection.insert_one(notif_doc)
        return Notification.get_by_id(res.inserted_id)

    @staticmethod
    def get_by_id(notif_id):
        try:
            return Notification.collection.find_one({'_id': ObjectId(notif_id)})
        except:
            return None

    @staticmethod
    def mark_as_read(notif_id):
        """Mark a notification as read."""
        try:
            Notification.collection.update_one(
                {'_id': ObjectId(notif_id)},
                {'$set': {'is_read': True}}
            )
            return True
        except:
            return False

    @staticmethod
    def mark_all_as_read(recipient_id):
        """Mark all notifications for a user as read."""
        try:
            Notification.collection.update_many(
                {'recipient_id': ObjectId(recipient_id), 'is_read': False},
                {'$set': {'is_read': True}}
            )
            return True
        except:
            return False

    @staticmethod
    def to_dict(doc):
        if not doc:
            return None
        return {
            'id': str(doc['_id']),
            'recipient_id': str(doc.get('recipient_id')) if doc.get('recipient_id') else None,
            'notification_type': doc.get('notification_type'),
            'title': doc.get('title'),
            'message': doc.get('message'),
            'related_id': str(doc.get('related_id')) if doc.get('related_id') else None,
            'related_type': doc.get('related_type'),
            'is_read': doc.get('is_read', False),
            'created_at': doc.get('created_at').isoformat() if hasattr(doc.get('created_at'), 'isoformat') else None
        }

class Review:
    collection = db.reviews

    @staticmethod
    def create(freelancer_id, reviewer_id, rating, comment):
        review_doc = {
            'freelancer_id': ObjectId(freelancer_id),
            'reviewer_id': ObjectId(reviewer_id),
            'rating': int(rating),
            'comment': comment,
            'created_at': datetime.utcnow()
        }
        res = Review.collection.insert_one(review_doc)
        return Review.collection.find_one({'_id': res.inserted_id})

    @staticmethod
    def get_by_freelancer(freelancer_id):
        return Review.collection.find({'freelancer_id': ObjectId(freelancer_id)}).sort('created_at', -1)

    @staticmethod
    def update(review_id, rating, comment):
        Review.collection.update_one(
            {'_id': ObjectId(review_id)},
            {'$set': {'rating': int(rating), 'comment': comment, 'updated_at': datetime.utcnow()}}
        )
        return Review.collection.find_one({'_id': ObjectId(review_id)})

    @staticmethod
    def to_dict(doc):
        if not doc:
            return None
        reviewer = User.get_by_id(doc.get('reviewer_id'))
        return {
            'id': str(doc['_id']),
            'freelancer_id': str(doc.get('freelancer_id')),
            'reviewer_id': str(doc.get('reviewer_id')),
            'reviewer_name': (reviewer.get('full_name') or reviewer.get('username')) if reviewer else 'Anonymous',
            'reviewer_avatar_url': reviewer.get('avatar_url') if reviewer else None,
            'rating': doc.get('rating'),
            'comment': doc.get('comment'),
            'created_at': doc.get('created_at').isoformat() if hasattr(doc.get('created_at'), 'isoformat') else None
        }

class Agreement:
    collection = db.agreements

    @staticmethod
    def create(application_id, job_id, client_id, freelancer_id, budget):
        """Create a new agreement when client accepts freelancer."""
        agreement_doc = {
            'application_id': ObjectId(application_id),
            'job_id': ObjectId(job_id),
            'client_id': ObjectId(client_id),
            'freelancer_id': ObjectId(freelancer_id),
            'budget': float(budget),
            'client_approved': False,
            'freelancer_approved': False,
            'payment_status': 'pending',  # pending → paid → held (in escrow)
            'completion_status': 'in_progress',  # in_progress → submitted → approved → rejected
            'amount_paid': 0.0,
            'app_fee_percent': 5.0,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        res = Agreement.collection.insert_one(agreement_doc)
        return Agreement.collection.find_one({'_id': res.inserted_id})

    @staticmethod
    def get_by_id(agreement_id):
        try:
            return Agreement.collection.find_one({'_id': ObjectId(agreement_id)})
        except:
            return None

    @staticmethod
    def approve(agreement_id, user_id):
        """Approve agreement (client or freelancer)."""
        agreement = Agreement.get_by_id(agreement_id)
        if not agreement:
            return None

        user_oid = ObjectId(user_id)
        update_dict = {}

        if user_oid == agreement.get('client_id'):
            update_dict['client_approved'] = True
        elif user_oid == agreement.get('freelancer_id'):
            update_dict['freelancer_approved'] = True
        else:
            return None

        update_dict['updated_at'] = datetime.utcnow()
        Agreement.collection.update_one({'_id': ObjectId(agreement_id)}, {'$set': update_dict})
        return Agreement.collection.find_one({'_id': ObjectId(agreement_id)})

    @staticmethod
    def to_dict(agreement_doc):
        if not agreement_doc:
            return None
        client = User.get_by_id(agreement_doc.get('client_id'))
        freelancer = User.get_by_id(agreement_doc.get('freelancer_id'))
        job = Job.get_by_id(agreement_doc.get('job_id'))
        budget = agreement_doc.get('budget', 0)
        app_fee_percent = agreement_doc.get('app_fee_percent', 5.0)
        app_fee = budget * (app_fee_percent / 100.0)
        freelancer_payout = budget - app_fee

        return {
            'id': str(agreement_doc['_id']),
            'application_id': str(agreement_doc.get('application_id')),
            'job_id': str(agreement_doc.get('job_id')),
            'job_title': job.get('title') if job else None,
            'client_id': str(agreement_doc.get('client_id')),
            'client_name': (client.get('full_name') or client.get('username')) if client else None,
            'freelancer_id': str(agreement_doc.get('freelancer_id')),
            'freelancer_name': (freelancer.get('full_name') or freelancer.get('username')) if freelancer else None,
            'budget': budget,
            'app_fee_percent': app_fee_percent,
            'app_fee': round(app_fee, 2),
            'freelancer_payout': round(freelancer_payout, 2),
            'client_approved': agreement_doc.get('client_approved', False),
            'freelancer_approved': agreement_doc.get('freelancer_approved', False),
            'both_approved': agreement_doc.get('client_approved', False) and agreement_doc.get('freelancer_approved', False),
            'payment_status': agreement_doc.get('payment_status', 'pending'),
            'amount_paid': agreement_doc.get('amount_paid', 0.0),
            'completion_status': agreement_doc.get('completion_status', 'in_progress'),
            'created_at': agreement_doc.get('created_at').isoformat() if hasattr(agreement_doc.get('created_at'), 'isoformat') else None,
            'updated_at': agreement_doc.get('updated_at').isoformat() if hasattr(agreement_doc.get('updated_at'), 'isoformat') else None
        }


class Transaction:
    collection = db.transactions

    @staticmethod
    def create(agreement_id, from_user_id, to_user_id, amount, transaction_type, description=''):
        """Create a transaction record."""
        transaction_doc = {
            'agreement_id': ObjectId(agreement_id),
            'from_user_id': ObjectId(from_user_id),
            'to_user_id': ObjectId(to_user_id),
            'amount': float(amount),
            'type': transaction_type,  # payment, freelancer_payout, app_fee
            'status': 'completed',
            'description': description,
            'created_at': datetime.utcnow()
        }
        res = Transaction.collection.insert_one(transaction_doc)
        return Transaction.collection.find_one({'_id': res.inserted_id})

    @staticmethod
    def to_dict(doc):
        if not doc:
            return None
        from_user = User.get_by_id(doc.get('from_user_id'))
        to_user = User.get_by_id(doc.get('to_user_id'))
        return {
            'id': str(doc['_id']),
            'agreement_id': str(doc.get('agreement_id')),
            'from_user_id': str(doc.get('from_user_id')),
            'from_user_name': (from_user.get('full_name') or from_user.get('username')) if from_user else None,
            'to_user_id': str(doc.get('to_user_id')),
            'to_user_name': (to_user.get('full_name') or to_user.get('username')) if to_user else None,
            'amount': doc.get('amount', 0.0),
            'type': doc.get('type'),
            'status': doc.get('status'),
            'description': doc.get('description'),
            'created_at': doc.get('created_at').isoformat() if hasattr(doc.get('created_at'), 'isoformat') else None
        }
