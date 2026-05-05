# Freelance App

A full-stack freelance marketplace application that connects **clients** who need work done with **freelancers** who offer their skills. The platform supports job posting, job applications, real-time chat, a digital products store, and role-based dashboards.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Backend](#backend)
   - [Features](#backend-features)
   - [Data Models](#data-models)
   - [API Endpoints](#api-endpoints)
   - [Setup & Installation](#backend-setup--installation)
5. [Frontend](#frontend)
   - [Features](#frontend-features)
   - [Pages & Navigation](#pages--navigation)
   - [Core Services](#core-services)
   - [Setup & Installation](#frontend-setup--installation)
6. [Running the Full Application](#running-the-full-application)
7. [Environment Variables](#environment-variables)
8. [Seeding the Database](#seeding-the-database)

---

## Project Overview

The Freelance App is a marketplace where:

- **Clients** post jobs, browse freelancer profiles, and manage applications.
- **Freelancers** browse open jobs, apply for positions, and maintain a CV-style profile (education, experience, portfolio).
- **Admins** monitor platform-wide statistics (user counts, job counts, applications).
- All users can exchange messages through a built-in **chat system**.
- A **digital store** allows users to browse and list products (templates, icons, etc.).

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Backend   | Python 3.8+, Flask, Flask-JWT-Extended, PyMongo |
| Database  | MongoDB                                         |
| Frontend  | Ionic 8, Angular 20, TypeScript                 |
| Auth      | JWT (JSON Web Tokens)                           |

---

## Project Structure

```
Freelance_app/
├── backend/                  # Flask REST API
│   ├── app.py                # Application entry point & factory
│   ├── config.py             # Configuration (dev/prod)
│   ├── routes.py             # All API route definitions
│   ├── models.py             # MongoDB models & collections
│   ├── create_admin.py       # Script to create an admin user
│   ├── seed_db.py            # Script to seed demo data
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Sample environment variables
│
└── frontend/                 # Ionic/Angular mobile-first web app
    ├── src/
    │   ├── app/
    │   │   ├── pages/        # All application pages/screens
    │   │   ├── services/     # API, Auth, and Role services
    │   │   ├── components/   # Shared UI components
    │   │   └── app-routing.module.ts  # Route definitions & guards
    │   ├── assets/           # Static assets (images, icons)
    │   ├── environments/     # Environment configs
    │   └── global.scss       # Global styles
    ├── angular.json
    ├── ionic.config.json
    └── package.json
```

---

## Backend

### Backend Features

- **JWT Authentication** — Secure login and token refresh flow.
- **Role-Based Access Control** — Endpoints are restricted based on user type (`client`, `freelancer`, `admin`).
- **Job Management** — Clients post jobs; freelancers apply; clients accept/reject applications.
- **Chat System** — Conversation and message management via polling.
- **Freelancer Profiles** — Skills, bio, hourly rate, education, experience, and portfolio.
- **Digital Store** — Marketplace for digital products.
- **Admin Analytics** — Platform-wide stats accessible to admins.
- **CORS Enabled** — Configured to allow requests from the Ionic frontend.

### Data Models

| Model       | Key Fields                                                                              |
|-------------|-----------------------------------------------------------------------------------------|
| **User**    | `username`, `email`, `password`, `user_type`, `full_name`, `bio`, `education[]`, `experience[]`, `portfolio[]`, `skills`, `hourly_rate` |
| **Job**     | `title`, `description`, `budget`, `client_id`, `status`, `duration`, `skills_required` |
| **Application** | `job_id`, `freelancer_id`, `status`, `created_at`                                  |
| **Message** | `conversation_id`, `sender_id`, `text`, `is_read`, `created_at`                        |
| **Product** | `name`, `description`, `price`, `category`, `seller_id`                                |

### API Endpoints

#### Authentication
| Method | Endpoint        | Description                        | Auth Required |
|--------|-----------------|------------------------------------|---------------|
| POST   | `/api/register` | Register a new user (client/freelancer) | No       |
| POST   | `/api/login`    | Login and receive JWT tokens       | No            |
| POST   | `/api/refresh`  | Refresh the access token           | Yes           |
| GET    | `/api/profile`  | Get the logged-in user's profile   | Yes           |
| PUT    | `/api/profile`  | Update profile (bio, skills, CV)   | Yes           |

#### Jobs
| Method | Endpoint                | Description                             | Auth Required |
|--------|-------------------------|-----------------------------------------|---------------|
| GET    | `/api/jobs`             | List all open jobs                      | No            |
| GET    | `/api/jobs/<id>`        | Get details of a specific job           | No            |
| POST   | `/api/jobs`             | Post a new job                          | Yes (Client)  |
| PUT    | `/api/jobs/<id>`        | Update a job                            | Yes (Client)  |
| DELETE | `/api/jobs/<id>`        | Delete a job                            | Yes (Client)  |
| GET    | `/api/my-jobs`          | List jobs posted by the current user    | Yes (Client)  |

#### Applications
| Method | Endpoint                              | Description                         | Auth Required     |
|--------|---------------------------------------|-------------------------------------|-------------------|
| POST   | `/api/jobs/<id>/apply`                | Apply for a job                     | Yes (Freelancer)  |
| GET    | `/api/jobs/<id>/applications`         | Get all applications for a job      | Yes (Client)      |
| POST   | `/api/applications/<id>/accept`       | Accept an application               | Yes (Client)      |
| POST   | `/api/applications/<id>/reject`       | Reject an application               | Yes (Client)      |
| GET    | `/api/my-applications`                | Get the current user's applications | Yes (Freelancer)  |

#### Chat
| Method | Endpoint                                  | Description                          | Auth Required |
|--------|-------------------------------------------|--------------------------------------|---------------|
| GET    | `/api/conversations`                      | List all conversations for the user  | Yes           |
| GET    | `/api/conversations/<id>`                 | Get a conversation and participant   | Yes           |
| GET    | `/api/conversations/<id>/messages`        | Get message history                  | Yes           |
| POST   | `/api/messages`                           | Send a message                       | Yes           |

#### Users
| Method | Endpoint              | Description                  | Auth Required |
|--------|-----------------------|------------------------------|---------------|
| GET    | `/api/users/<id>`     | Get a user's public profile  | No            |
| GET    | `/api/freelancers`    | List all freelancers         | No            |

#### Store
| Method | Endpoint          | Description               | Auth Required      |
|--------|-------------------|---------------------------|--------------------|
| GET    | `/api/products`   | List all digital products | No                 |
| POST   | `/api/products`   | Add a new product         | Yes (Admin/Seller) |

#### Admin
| Method | Endpoint            | Description                    | Auth Required |
|--------|---------------------|--------------------------------|---------------|
| GET    | `/api/admin/stats`  | Get platform-wide analytics    | Yes (Admin)   |

#### Health
| Method | Endpoint       | Description   |
|--------|----------------|---------------|
| GET    | `/api/health`  | Health check  |

### Backend Setup & Installation

**Prerequisites:** Python 3.8+, MongoDB (running locally or via Atlas)

```bash
cd backend

# 1. Create and activate a virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your values

# 4. Run the server
python app.py
```

The API will be available at `http://localhost:5000`.

---

## Frontend

### Frontend Features

- **Splash Screen** — Auto-redirects to the appropriate dashboard if already logged in, or to the role-selection page for guests.
- **Role-Based Dashboards** — Separate dashboards for Freelancer, Client, and Admin.
- **Chat with Polling** — Messages refresh every 3 seconds automatically.
- **CV Management** — Freelancers can add/edit education and experience entries.
- **Digital Store** — Browsable marketplace with category filtering.
- **Auth Guard** — Protects sensitive routes (`/dashboard`, `/chat`, `/profile`).
- **Auth Interceptor** — Automatically attaches the JWT Bearer token to every API request and logs out on a `401` response.

### Pages & Navigation

| Page                  | Route / Folder          | Description                                           |
|-----------------------|-------------------------|-------------------------------------------------------|
| Splash                | `splash`                | App entry point; redirects based on auth state        |
| Interests             | `interests`             | Role selection for new guests                         |
| Login                 | `login`                 | User login form                                       |
| Sign Up               | `signup`                | User registration form                                |
| Dashboard (Freelancer)| `dashboard`             | Job opportunities and application status              |
| Dashboard Client      | `dashboard-client`      | Featured freelancers and quick job posting            |
| Dashboard Admin       | `dashboard-admin`       | Platform-wide statistics                              |
| Browse                | `browse`                | Browse all freelancers                                |
| Gigs List             | `gigs-list`             | Browse available jobs/gigs                            |
| Create Gig            | `create-gig`            | Client form to post a new job                         |
| Chat                  | `chat`                  | Messaging interface for a specific conversation       |
| Conversations List    | `conversations-list`    | List of all conversations                             |
| Freelancer Profile    | `freelancer-profile`    | View/edit a freelancer's full profile and CV          |
| Profile Client        | `profile-client`        | Client profile page                                   |
| Profile Admin         | `profile-admin`         | Admin profile page                                    |
| Store                 | `store`                 | Digital products marketplace                          |
| Freelancer Welcome    | `freelancer-welcome`    | Onboarding screen for freelancers                     |
| Client Welcome        | `client-welcome`        | Onboarding screen for clients                         |
| Admin Welcome         | `admin-welcome`         | Onboarding screen for admins                          |
| Not Found             | `not-found`             | 404 page                                              |

### Core Services

| Service                | File                   | Responsibility                                                               |
|------------------------|------------------------|------------------------------------------------------------------------------|
| **ApiService**         | `api.service.ts`       | Central HTTP client; all API calls (GET, POST, PUT, DELETE)                  |
| **AuthService**        | `auth.ts`              | Login/logout flow, wraps ApiService auth calls                               |
| **RoleService**        | `role.service.ts`      | Persists JWT token and user object in `localStorage`; exposes `isAuthenticated` and `role` properties |
| **AuthGuard**          | `auth.guard.ts`        | Route guard; redirects unauthenticated users to login                        |
| **AuthInterceptor**    | `auth.interceptor.ts`  | HTTP interceptor; injects Bearer token; handles 401 auto-logout              |

### Frontend Setup & Installation

**Prerequisites:** Node.js 18+, npm, Ionic CLI (`npm install -g @ionic/cli`)

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the development server
ionic serve
# or
npm start
```

The app will be available at `http://localhost:8100`.

---

## Running the Full Application

Run both servers simultaneously in separate terminals:

**Terminal 1 — Backend:**
```bash
cd backend
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
python app.py
```

**Terminal 2 — Frontend:**
```bash
cd frontend
ionic serve
```

Make sure MongoDB is running before starting the backend.

---

## Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
# Flask Configuration
FLASK_CONFIG=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database Configuration
MONGO_URI=mongodb://localhost:27017/freelanceapp
```

The frontend API base URL is configured in `frontend/src/app/services/api.service.ts` (`http://localhost:5000/api` by default). Update it to match your backend URL if needed.

---

## Seeding the Database

A seed script is provided to populate the database with demo data (admin, client, freelancer users, sample jobs, and chat history):

```bash
cd backend
python seed_db.py
```

> ⚠️ This will **clear all existing data** before inserting demo records.

To create a standalone admin user:

```bash
cd backend
python create_admin.py
```
