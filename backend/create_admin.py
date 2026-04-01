import sys
from models import User

def create_admin(email, password, full_name="Admin User"):
    # Check if admin already exists
    existing = User.get_by_email(email)
    if existing:
        print(f"Error: User with email '{email}' already exists.")
        return
    
    # Create the admin user (username based on email split)
    username = email.split('@')[0]
    
    print(f"Creating admin account for {email}...")
    user_doc = User.create(
        username=username,
        email=email,
        password=password,
        user_type='admin',
        full_name=full_name,
        bio="System Administrator"
    )
    
    print(f"Success! Admin account created. ID: {user_doc['_id']}")

if __name__ == "__main__":
    print("FreelanceHub - Admin Registration Script")
    print("----------------------------------------")
    email = input("Enter admin email: ").strip()
    password = input("Enter admin password: ").strip()
    
    if not email or not password:
        print("Both email and password are required.")
        sys.exit(1)
        
    create_admin(email, password)
