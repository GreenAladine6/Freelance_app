import sys
from pymongo import MongoClient
from datetime import datetime, timedelta
import random
from bson import ObjectId

from models import User, Job, Application, Conversation, AdminLog, Report

print("Seeding FreelanceHub Database...")

# Delete old records
User.collection.delete_many({})
Job.collection.delete_many({})
Application.collection.delete_many({})
AdminLog.collection.delete_many({})
Report.collection.delete_many({})
db = User.collection.database
db.products.delete_many({})
db.messages.delete_many({})
db.conversations.delete_many({})
print("Cleared existing collections.")

# Add users
users = [
    # Admin
    {'username': 'admin', 'email': 'admin@fh.com', 'password': 'password123', 'user_type': 'admin', 'full_name': 'Systen Admin', 'bio': 'Platform manager'},
    
    # Clients
    {'username': 'techcorp', 'email': 'techcorp@fh.com', 'password': 'password123', 'user_type': 'client', 'full_name': 'TechCorp Inc.', 'bio': 'A leading tech company looking for talent'},
    {'username': 'startup', 'email': 'startup@fh.com', 'password': 'password123', 'user_type': 'client', 'full_name': 'Innovate Startup', 'bio': 'Fast growing startup'},

    # Freelancers
    {'username': 'alexc', 'email': 'alex@fh.com', 'password': 'password123', 'user_type': 'freelancer', 'full_name': 'Alex Chen', 'bio': 'Senior UI/UX Designer', 'skills': 'Figma, React, Tailwind', 'hourly_rate': 45.0},
    {'username': 'sarahm', 'email': 'sarah@fh.com', 'password': 'password123', 'user_type': 'freelancer', 'full_name': 'Sarah Miller', 'bio': 'Full-stack React Developer', 'skills': 'React, TypeScript, Node.js', 'hourly_rate': 60.0},
    {'username': 'davidw', 'email': 'david@fh.com', 'password': 'password123', 'user_type': 'freelancer', 'full_name': 'David Wolf', 'bio': 'Brand Strategist & Logo Expert', 'skills': 'Branding, Marketing, Adobe Illustrator', 'hourly_rate': 55.0}
]

created_users = {}

for u in users:
    user_doc = User.create(
        username=u['username'],
        email=u['email'],
        password=u['password'],
        user_type=u['user_type'],
        full_name=u.get('full_name'),
        bio=u.get('bio'),
        skills=u.get('skills'),
        hourly_rate=u.get('hourly_rate')
    )
    created_users[u['username']] = user_doc['_id']

# Add Jobs
jobs = [
    {
        'title': 'Frontend Developer Needed',
        'description': 'Looking for a React expert to build a dashboard.',
        'budget': '500-1000$',
        'client_id': created_users['techcorp'],
        'is_approved': True,
        'status': 'open',
        'created_at': datetime.utcnow()
    },
    {
        'title': 'Logo Design for Startup',
        'description': 'Need a modern logo for a new fintech startup.',
        'budget': '200$',
        'client_id': created_users['startup'],
        'is_approved': False,
        'status': 'open',
        'created_at': datetime.utcnow()
    }
]
Job.collection.insert_many(jobs)

# Add Education & Experience to Alex
User.collection.update_one({'_id': created_users['alexc']}, {
    '$set': {
        'education': [
            {'school': 'Design Institute', 'degree': 'B.A. in Visual Design', 'year': '2018'}
        ],
        'experience': [
            {'company': 'Creative Lab', 'role': 'Lead Designer', 'duration': '2019-2022', 'description': 'Managed a team of 5.'}
        ]
    }
})

# Add Store Products
products = [
    {'name': 'Premium Dashboard Kit', 'description': 'Modern UI Kit for SaaS Designers', 'price': 49.99, 'category': 'UI Kits', 'seller_id': created_users['alexc'], 'is_approved': True, 'image_url': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'},
    {'name': 'Icon Collection - 500+', 'description': 'Multi-style icon set for web', 'price': 24.99, 'category': 'Icons', 'seller_id': created_users['sarahm'], 'is_approved': False, 'image_url': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop'}
]
db.products.insert_many(products)

# Create a conversation
conv = Conversation.get_or_create(created_users['techcorp'], created_users['alexc'])
msgs = [
    {'conversation_id': conv['_id'], 'sender_id': created_users['techcorp'], 'text': 'Hey Alex, are you available?', 'created_at': datetime.utcnow() - timedelta(hours=1)},
    {'conversation_id': conv['_id'], 'sender_id': created_users['alexc'], 'text': 'Hi! Yes, I am.', 'created_at': datetime.utcnow()}
]
db.messages.insert_many(msgs)
db.conversations.update_one({'_id': conv['_id']}, {'$set': {'last_message_at': datetime.utcnow()}})

# Add AdminLogs & Reports
print("Seeding Admin data...")
AdminLog.create(created_users['admin'], "Platform Initialization", details="Database seeded for initial launch")
AdminLog.create(created_users['admin'], "Approved verified freelancer: Alex Chen")
AdminLog.create(created_users['admin'], "Settings Update", details="Platform fees updated to 5%")

reports = [
    {'reporter_id': created_users['sarahm'], 'reason': 'Spam messaging', 'target_type': 'user', 'target_id': created_users['davidw'], 'status': 'pending', 'created_at': datetime.utcnow() - timedelta(days=1)},
    {'reporter_id': created_users['alexc'], 'reason': 'Inappropriate content in Gig description', 'target_type': 'gig', 'target_id': ObjectId(), 'status': 'pending', 'created_at': datetime.utcnow()}
]
Report.collection.insert_many(reports)

print("Database successfully seeded with Chat, Store, CV and Admin data!")
