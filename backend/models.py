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
    def create(username, email, password, user_type, full_name=None, bio=None, skills=None, hourly_rate=None):
        password_hash = generate_password_hash(password)
        user_doc = {
            'username': username,
            'email': email,
            'password_hash': password_hash,
            'user_type': user_type,
            'full_name': full_name,
            'bio': bio,
            'skills': skills,
            'hourly_rate': hourly_rate,
            'education': [],
            'experience': [],
            'portfolio': [],
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
        return check_password_hash(user_doc['password_hash'], password)

    @staticmethod
    def set_password(user_id, password):
        password_hash = generate_password_hash(password)
        User.collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"password_hash": password_hash}})

    @staticmethod
    def to_dict(user_doc):
        if not user_doc:
            return None
        return {
            'id': str(user_doc['_id']),
            'username': user_doc.get('username'),
            'email': user_doc.get('email'),
            'user_type': user_doc.get('user_type'),
            'full_name': user_doc.get('full_name'),
            'bio': user_doc.get('bio'),
            'skills': user_doc.get('skills'),
            'hourly_rate': user_doc.get('hourly_rate'),
            'education': user_doc.get('education', []),
            'experience': user_doc.get('experience', []),
            'portfolio': user_doc.get('portfolio', []),
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

        return {
            'id': str(doc['_id']),
            'last_message_at': doc.get('last_message_at').isoformat() if hasattr(doc.get('last_message_at'), 'isoformat') else None,
            'other_user': User.to_dict(other_user) if other_user else None,
            'last_message': Message.to_dict(last_msg) if last_msg else None
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
        return {
            'id': str(doc['_id']),
            'name': doc.get('name'),
            'description': doc.get('description'),
            'price': doc.get('price'),
            'image_url': doc.get('image_url'),
            'category': doc.get('category'),
            'seller_id': str(doc.get('seller_id')),
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
