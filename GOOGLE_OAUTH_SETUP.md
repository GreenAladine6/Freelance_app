# Google OAuth Setup Guide

## Overview
This guide will help you set up Google OAuth login for your Freelance App.

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **Credentials** in the left sidebar
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web Application**
6. Add these authorized redirect URIs:
   - `http://localhost:3000` (for local development)
   - `http://localhost:4200` (for Angular dev server)
   - `https://yourdomain.com` (for production)
7. Copy your **Client ID** (will look like: `xxx.apps.googleusercontent.com`)

## Step 2: Frontend Configuration

### In `frontend/src/app/pages/login/login.page.html`

Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID:
```html
<div id="g_id_onload"
  data-client_id="YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com"
  data-callback="handleCredentialResponse">
</div>
```

## Step 3: Backend Configuration

### Create `.env` file in the `backend` folder

Create a file named `.env` in the backend directory:
```bash
# Backend/.env
FLASK_CONFIG=development
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com
MONGODB_URI=your_mongodb_connection_string
```

### Update `backend/config.py`

If you haven't already, add the GOOGLE_CLIENT_ID to your config:
```python
import os

class Config:
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com')
```

## Step 4: Install Dependencies

### Backend
```bash
cd backend
pip install -r requirements.txt
```

The new `google-auth-oauthlib` package is already added to requirements.txt

### Frontend
Google Sign-In is loaded from CDN, so no npm package needed.

## Step 5: Test the Integration

1. **Start Backend:**
   ```bash
   cd backend
   python app.py
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Navigate to Login Page:**
   - Go to `http://localhost:4200/login`
   - You should see the Google Sign-In button
   - Click it and authenticate with your Google account

## Features

### New User Registration
When a new user logs in with Google for the first time:
- A new account is automatically created
- Username: email prefix (e.g., john from john@email.com)
- User type: freelancer (default)
- Email: from Google account
- Full name: from Google profile

### Existing User Login
If a user already has an account with the same email:
- They are logged in with their existing account
- Existing user type is preserved

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | `xxx.apps.googleusercontent.com` |
| `FLASK_CONFIG` | Environment (development/production) | `development` |

## Troubleshooting

### "Google authentication failed"
- Check that GOOGLE_CLIENT_ID is correctly set in .env
- Verify your redirect URIs are registered in Google Cloud Console
- Check browser console for CORS errors

### "Email not found in Google token"
- Ensure the Google account is using an email-based login
- Some Google accounts might not have email in token metadata

### CORS errors
- Backend CORS is already configured to accept requests from localhost
- For production, update `backend/app.py` CORS configuration

## Security Notes

🔒 **Important:**
- Never commit `.env` files to version control
- Keep GOOGLE_CLIENT_ID secret
- Use environment variables, never hardcode credentials
- In production, use HTTPS for OAuth flow

## Next Steps

After setup, you can:
1. Customize the default user type for Google signups
2. Add optional profile completion after Google login
3. Store Google profile picture as user avatar
4. Implement user role selection during first login

## Support

For issues:
1. Check browser console (F12) for errors
2. Check backend logs for authentication errors
3. Verify GOOGLE_CLIENT_ID matches between frontend and backend
