# Freelance App Backend

A Flask-based REST API for a freelance marketplace application.

## Features

- User authentication (JWT-based)
- User types: Clients and Freelancers
- Job posting and management
- Job application system
- Freelancer profiles with skills

## Requirements

- Python 3.8+
- See `requirements.txt` for dependencies

## Installation

1. Create a virtual environment:
   
```
bash
   python -m venv .venv
   
```

2. Activate the virtual environment:
   - Windows: `.venv\Scripts\activate`
   - Mac/Linux: `source .venv/bin/activate`

3. Install dependencies:
   
```
bash
   pip install -r requirements.txt
   
```

4. (Optional) Copy `.env.example` to `.env` and configure:
   
```
bash
   copy .env.example .env
   
```

## Running the Server

```
bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login and get JWT token
- `POST /api/refresh` - Refresh access token
- `GET /api/me` - Get current user profile
- `PUT /api/me` - Update current user profile

### Jobs
- `GET /api/jobs` - Get all open jobs (public)
- `GET /api/jobs/<id>` - Get job details
- `POST /api/jobs` - Create a new job (client only)
- `PUT /api/jobs/<id>` - Update a job (client only)
- `DELETE /api/jobs/<id>` - Delete a job (client only)
- `GET /api/my-jobs` - Get jobs posted by current user

### Applications
- `POST /api/jobs/<id>/apply` - Apply for a job (freelancer only)
- `GET /api/jobs/<id>/applications` - Get job applications (client only)
- `POST /api/applications/<id>/accept` - Accept an application
- `POST /api/applications/<id>/reject` - Reject an application
- `GET /api/my-applications` - Get user's applications

### Users
- `GET /api/users/<id>` - Get user profile
- `GET /api/freelancers` - Get all freelancers

### Health
- `GET /api/health` - Health check endpoint

## Example Usage

### Register a client:
```
bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username": "client1", "email": "client@example.com", "password": "password123", "user_type": "client", "full_name": "John Doe"}'
```

### Login:
```
bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "client@example.com", "password": "password123"}'
```

### Create a job (with JWT token):
```
bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "Build a website", "description": "Need a simple portfolio website", "budget": 500, "duration": "1 week", "skills_required": "HTML,CSS,JavaScript"}'
```

## Database

The application uses SQLite by default. The database file (`freelance.db`) will be created automatically when you run the application.
