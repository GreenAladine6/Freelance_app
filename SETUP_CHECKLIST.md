# Google OAuth - Complete Setup Checklist

## ✅ Checklist

- [x] Frontend service methods added
- [x] Backend endpoint created  
- [x] Google auth library added to requirements
- [x] Environment configuration updated
- [x] Login UI component updated
- [x] HTML Google Sign-In widget integrated

**Next steps for you:**

- [ ] Create Google OAuth credentials at https://console.cloud.google.com/
- [ ] Replace `YOUR_GOOGLE_CLIENT_ID` in frontend/src/app/pages/login/login.page.html
- [ ] Add `GOOGLE_CLIENT_ID=...` to backend/.env
- [ ] Run `pip install -r requirements.txt` in backend folder
- [ ] Test login on http://localhost:4200/login

## Configuration Files

### 1. backend/.env
Make sure this line exists:
```
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com
```

### 2. frontend/src/app/pages/login/login.page.html
Make sure this line exists (around line 73):
```html
data-client_id="YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com"
```

## Package Installation

```bash
cd backend
pip install google-auth-oauthlib
```

Or use requirements.txt:
```bash
pip install -r requirements.txt
```

## Testing the Integration

### Terminal 1 - Backend
```bash
cd backend
python app.py
# Should see: Running on http://127.0.0.1:5000
```

### Terminal 2 - Frontend  
```bash
cd frontend
npm start
# Should see: Application bundle generated successfully
```

### Browser
1. Open http://localhost:4200/login
2. Look for "Continue with Google" button (below email/password)
3. Click it and authenticate with your Google account
4. Should redirect to dashboard

## API Endpoint Details

**Endpoint:** POST `/api/login-google`

**Request Body:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMyJ9..."
}
```

**Success Response:**
```json
{
  "message": "Google login successful",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@gmail.com",
    "username": "user",
    "full_name": "User Name",
    "user_type": "freelancer",
    "created_at": "2024-01-01T00:00:00"
  },
  "is_new_user": true
}
```

**Error Response:**
```json
{
  "error": "Google token is required"
}
```

## Code Files Summary

### Backend Routes (routes.py)
- Import added: `from google.auth.transport import requests` and `from google.oauth2 import id_token`
- New endpoint: `@api.route('/login-google', methods=['POST'])`
- Logic: Verify Google token → Find/create user → Generate JWT → Return response

### Frontend Services
- `AuthService`: New method `loginWithGoogle(googleToken: string)`
- `ApiService`: New method `loginWithGoogle(token: string)`
- Login Component: New method `handleGoogleLogin(response: any)`

### Frontend UI
- HTML: Google Sign-In widget embedded
- Component: Global callback registered
- Styling: Uses native Google Sign-In styles

## User Roles After Google Login

- **New users** are automatically assigned: **freelancer**
- **Existing users** keep their current role
- To change default role, edit backend/routes.py line ~122

## Security Notes

✅ Token verification using official Google library
✅ JWT tokens for subsequent requests  
✅ CORS configured for local development
✅ Password-less authentication for Google users

## Support Files

- `GOOGLE_OAUTH_SETUP.md` - Detailed step-by-step guide
- `GOOGLE_OAUTH_IMPLEMENTATION.md` - Technical implementation details
- `QUICK_START_GOOGLE_OAUTH.md` - Quick reference guide
- This file - Complete setup checklist

## Common Issues & Solutions

**"Cannot find module 'google.oauth2'"**
→ Run: `pip install google-auth-oauthlib`

**"Google authentication failed: invalid_audience"**
→ Check GOOGLE_CLIENT_ID matches in .env and frontend

**"CORS error"**
→ Ensure backend is running (python app.py)

**Button not appearing**
→ Check browser console (F12) for JavaScript errors
→ Verify Google client ID format

---

**You're all set! 🎉**

Once you add your Google Client ID, Google OAuth login will be working!
