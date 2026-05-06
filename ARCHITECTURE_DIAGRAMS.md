# Google OAuth Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR APPLICATION                         │
├──────────────────────┬──────────────────────┬──────────────────┤
│    FRONTEND          │     BACKEND          │    DATABASE      │
│   (Angular/Ionic)    │   (Flask/Python)     │    (MongoDB)     │
│                      │                      │                  │
│  ┌────────────────┐  │  ┌────────────────┐  │  ┌────────────┐ │
│  │ Login Component│  │  │  /api/login    │  │  │   Users    │ │
│  │  - Email/Pwd   │  │  │  - Verify creds│  │  │ Collection │ │
│  │  - Google Btn  │  │  │  - Create JWT  │  │  │            │ │
│  └────────────────┘  │  └────────────────┘  │  └────────────┘ │
│          │           │          ▲            │                  │
│          │           │          │            │                  │
│  ┌────────────────┐  │  ┌────────────────┐  │                  │
│  │ Auth Service   │  │  │ /api/login-    │  │                  │
│  │ - login()      │  │  │    google      │  │                  │
│  │ - loginGoogle()│  │  │  NEW ENDPOINT! │  │                  │
│  └────────────────┘  │  │  - Verify token│  │                  │
│          │           │  │  - Find/Create │  │                  │
│          │           │  │    user        │  │                  │
│  ┌────────────────┐  │  │  - Create JWT  │  │                  │
│  │ API Service    │  │  └────────────────┘  │                  │
│  │ - login()      │  │          ▲            │                  │
│  │ - loginGoogle()│  │          │            │                  │
│  │   NEW METHOD!  │  │          │            │                  │
│  └────────────────┘  │          └────────────┼──────────────────│
└──────────────────────┴──────────────────────┴──────────────────┘
           │                                          
           │                                          
           └─────────────────┬─────────────────┐     
                             │                 │     
                    ┌────────▼─────────┐       │     
                    │  Google OAuth    │       │     
                    │  Services        │       │     
                    │                  │       │     
                    │ - Token Verify   │       │     
                    │ - User Info      │       │     
                    │ - Auth Dialog    │       │     
                    └──────────────────┘       │     
                                               │     
                                    ┌──────────▼─────────┐
                                    │  Google Sign-In    │
                                    │  SDK (Browser JS)  │
                                    └────────────────────┘
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE OAUTH FLOW                            │
└─────────────────────────────────────────────────────────────────┘

STEP 1: User clicks Google button
┌──────────────────────────────────────────────────────────┐
│ Frontend: login.page.html                                │
│                                                          │
│ <div id="g_id_onload"                                    │
│   data-client_id="YOUR_CLIENT_ID"                        │
│   data-callback="handleCredentialResponse">             │
│ </div>                                                   │
│ <div class="g_id_signin"></div>  ← User clicks here      │
└──────────────────────────────────────────────────────────┘
                       │
                       ▼
STEP 2: Google popup appears
┌──────────────────────────────────────────────────────────┐
│ Google Authentication Dialog                             │
│                                                          │
│ "Sign in with your Google account"                       │
│ [user enters email & password]                           │
│                                                          │
│ Result: Google sends back ID Token (JWT)                 │
└──────────────────────────────────────────────────────────┘
                       │
                       ▼
STEP 3: Frontend sends token to backend
┌──────────────────────────────────────────────────────────┐
│ Frontend: login.page.ts                                  │
│                                                          │
│ handleGoogleLogin(response) {                            │
│   const googleToken = response.credential                │
│   this.auth.loginWithGoogle(googleToken)                 │
│ }                                                        │
│                                                          │
│ Request to: POST /api/login-google                       │
│ Body: { token: "eyJhbGc..." }                            │
└──────────────────────────────────────────────────────────┘
                       │
                       ▼
STEP 4: Backend verifies token with Google
┌──────────────────────────────────────────────────────────┐
│ Backend: routes.py                                       │
│                                                          │
│ @api.route('/login-google')                              │
│ idinfo = id_token.verify_oauth2_token(                   │
│   token,                                                 │
│   requests.Request(),                                    │
│   GOOGLE_CLIENT_ID                                       │
│ )                                                        │
│                                                          │
│ Extract: email, name, picture, etc.                      │
└──────────────────────────────────────────────────────────┘
                       │
         ┌─────────────┴──────────────┐
         │                            │
    New User?                    Existing User?
         │                            │
         ▼                            ▼
┌────────────────────────┐   ┌──────────────────────┐
│ Create new account:    │   │ Use existing account │
│                        │   │                      │
│ - Username: from email │   │ - Keep all settings  │
│ - Email: from Google   │   │ - Preserve user_type │
│ - User Type: freelancer│   │ - User already has   │
│ - Name: from Google    │   │   password (maybe)   │
└────────────────────────┘   └──────────────────────┘
         │                            │
         └─────────────┬──────────────┘
                       ▼
STEP 5: Generate JWT tokens
┌──────────────────────────────────────────────────────────┐
│ Backend: routes.py                                       │
│                                                          │
│ user_id = str(user_doc['_id'])                           │
│ access_token = create_access_token(user_id)              │
│ refresh_token = create_refresh_token(user_id)            │
└──────────────────────────────────────────────────────────┘
                       │
                       ▼
STEP 6: Return tokens and user info
┌──────────────────────────────────────────────────────────┐
│ Response to Frontend:                                     │
│                                                          │
│ {                                                        │
│   "message": "Google login successful",                  │
│   "access_token": "eyJhbGc...",                          │
│   "refresh_token": "eyJhbGc...",                         │
│   "user": {                                              │
│     "id": "507f...",                                     │
│     "email": "user@gmail.com",                           │
│     "user_type": "freelancer",                           │
│     ...                                                  │
│   }                                                      │
│ }                                                        │
└──────────────────────────────────────────────────────────┘
                       │
                       ▼
STEP 7: Frontend stores tokens and navigates
┌──────────────────────────────────────────────────────────┐
│ Frontend: login.page.ts                                  │
│                                                          │
│ this.role.handleLoginSuccess(response)                   │
│ [stores tokens in localStorage]                          │
│                                                          │
│ const userType = response.user.user_type                 │
│ if (userType === 'freelancer')                           │
│   router.navigate(['/dashboard'])                        │
│ else if (userType === 'client')                          │
│   router.navigate(['/dashboard-client'])                 │
└──────────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ ✅ User logged in and redirected to dashboard            │
└──────────────────────────────────────────────────────────┘
```

## Database Flow

```
BEFORE: No Google OAuth
┌─────────────────┐
│  Users Table    │
│                 │
│ • id            │
│ • email         │
│ • password ◄─── AUTH (stored hash)
│ • username      │
│ • user_type     │
│ • created_at    │
└─────────────────┘

AFTER: With Google OAuth  
┌─────────────────────────────────────────┐
│          Users Table (same)              │
│                                          │
│ • id                                     │
│ • email                    ◄─ Google     │
│ • password (NULL for Google users) ◄─── OAuth
│ • username              ◄─ From email   │
│ • user_type = "freelancer" ◄─ Default   │
│ • full_name             ◄─ From Google  │
│ • created_at                            │
└─────────────────────────────────────────┘
```

## API Endpoint Map

```
┌────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION ROUTES                    │
└────────────────────────────────────────────────────────────┘

POST /api/register
├─ Input: username, email, password, user_type
├─ Creates: New user account
└─ Returns: User object

POST /api/login ← EXISTING
├─ Input: email, password
├─ Validates: Credentials
└─ Returns: JWT tokens + user

POST /api/login-google ← NEW!
├─ Input: Google ID token
├─ Verifies: Token with Google
├─ Handles: New user creation OR existing user
└─ Returns: JWT tokens + user

POST /api/refresh
├─ Input: Refresh token
├─ Generates: New access token
└─ Returns: New access token

GET /api/me
├─ Auth: Required (JWT)
└─ Returns: Current user profile

PUT /api/me
├─ Auth: Required (JWT)
├─ Input: Updated profile fields
└─ Updates: User profile
```

## Configuration Map

```
FRONTEND CONFIGURATION
├─ frontend/src/app/pages/login/login.page.html
│  └─ data-client_id="YOUR_GOOGLE_CLIENT_ID"
│
├─ frontend/src/app/pages/login/login.page.ts
│  └─ Google sign-in handler
│
├─ frontend/src/app/services/auth.ts
│  └─ loginWithGoogle() method
│
└─ frontend/src/app/services/api.service.ts
   └─ loginWithGoogle() API call


BACKEND CONFIGURATION
├─ backend/.env
│  └─ GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
│
├─ backend/routes.py
│  └─ @api.route('/login-google') endpoint
│
└─ backend/requirements.txt
   └─ google-auth-oauthlib
```

## Data Flow Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Click "Continue with Google"
       ▼
┌─────────────────────────────┐
│  Google Sign-In Widget      │
│  (loaded from CDN)          │
└──────┬──────────────────────┘
       │
       │ 2. User authenticates
       ▼
┌─────────────────────────────┐
│  Google OAuth Server        │
│  Verifies credentials       │
│  Returns: ID Token (JWT)    │
└──────┬──────────────────────┘
       │
       │ 3. Token sent to callback
       ▼
┌─────────────────────────────┐
│  handleCredentialResponse() │
│  (Frontend: login.page.ts)  │
│  Extracts: token            │
└──────┬──────────────────────┘
       │
       │ 4. POST /api/login-google
       │    Body: { token }
       ▼
┌─────────────────────────────┐
│  Flask Backend              │
│  /api/login-google endpoint │
│  (routes.py)                │
└──────┬──────────────────────┘
       │
       │ 5. Verify token with Google
       │    (uses google.oauth2)
       ▼
┌─────────────────────────────┐
│  Google Token Verification  │
│  Service                    │
└──────┬──────────────────────┘
       │
       │ 6. Token valid → Extract user data
       ▼
┌─────────────────────────────┐
│  Check MongoDB for user     │
│  by email address           │
└──────┬──────────────────────┘
       │
   ┌───┴────┐
   │         │
New User?  Existing?
   │         │
   ▼         ▼
Create    Use
Account   Existing
   │         │
   └────┬────┘
        │
        │ 7. Generate JWT tokens
        ▼
┌─────────────────────────────┐
│  Return to Frontend:        │
│  - access_token             │
│  - refresh_token            │
│  - user object              │
└──────┬──────────────────────┘
       │
       │ 8. Store tokens locally
       │    Navigate to dashboard
       ▼
┌─────────────────────────────┐
│  User Dashboard             │
│  (role-based redirect)      │
└─────────────────────────────┘
```

---

## Summary

- **No breaking changes** to existing email/password login
- **Seamless integration** with existing user system
- **Automatic account creation** for new Google users
- **Email-based matching** prevents duplicate accounts
- **Full JWT support** for ongoing sessions

