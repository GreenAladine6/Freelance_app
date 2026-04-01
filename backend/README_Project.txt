FREELANCE APP - BACKEND DOCUMENTATION
======================================

1. DATABASE CONNECTION (MongoDB)
------------------------------
- File: backend/models.py
- Connection: The app connects to a local MongoDB instance.
- Database Name: 'freelanceapp'
- Connection String: 'mongodb://localhost:27017/'
- How it works: 
  The `client` object in `models.py` initializes the connection. 
  Each model (User, Job, Message, etc.) has a `.collection` property that points to its respective MongoDB collection.

2. AUTHENTICATION & SECURITY (JWT)
----------------------------------
- File: backend/auth.py
- Mechanism: JSON Web Tokens (JWT).
- SECRET_KEY: 'super-secret-key'
- Routes protected by `@jwt_required()` require a valid 'Authorization: Bearer <token>' header.
- The `get_jwt_identity()` function retrieves the user's ID from the token.

3. CORE API ROUTES (backend/routes.py)
-------------------------------------
The API is divided into several modules:

A. AUTHENTICATION
   - POST /api/register: Create a new account (Client or Freelancer).
   - POST /api/login: Get access and refresh tokens.
   - GET /api/profile: Get details of the currently logged-in user.
   - PUT /api/profile: Update bio, skills, hourly rate, and CV fields (education/experience).

B. CHAT SYSTEM
   - GET /api/conversations: List all active chats for the current user.
   - GET /api/conversations/<id>: Get details of a single chat and the other participant.
   - GET /api/conversations/<id>/messages: Get message history (polling).
   - POST /api/messages: Send a message to a recipient or conversation.

C. JOBS & APPLICATIONS
   - GET /api/jobs: List all open jobs.
   - POST /api/jobs: Post a new job (Client only).
   - POST /api/jobs/<id>/apply: Freelancers apply for a job.
   - GET /api/my-jobs: List jobs posted by the client.

D. STORE (MARKETPLACE)
   - GET /api/products: List all digital items.
   - POST /api/products: Add a product (Admin/Seller only).

E. ADMIN
   - GET /api/admin/stats: Platform-wide analytics (Total users, jobs, apps).

4. DATA MODELS & FIELDS
-----------------------
- User Document: { username, email, password, user_type, full_name, bio, education[], experience[], portfolio[] }
- Message Document: { conversation_id, sender_id, text, is_read, created_at }
- Job Document: { title, description, budget, client_id, status }

5. HOW TO SEED DATA
------------------
- File: backend/seed_db.py
- Run: `python seed_db.py`
- Result: Clears existing data and creates mock admin, client, freelancer, and chat history.
