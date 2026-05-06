# 🔐 Google OAuth - Quick Reference

## What Was Changed

### ✅ Frontend Changes
- `login.page.ts` - Added Google Sign-In handler and method
- `login.page.html` - Added Google Sign-In widget
- `auth.ts` - Added `loginWithGoogle()` method
- `api.service.ts` - Added Google login API call

### ✅ Backend Changes  
- `routes.py` - Added `/api/login-google` endpoint with token verification
- `requirements.txt` - Added `google-auth-oauthlib` package
- `.env` - Added `GOOGLE_CLIENT_ID` configuration

---

## 3-Step Setup

### Step 1️⃣ Get Google Credentials
Go to https://console.cloud.google.com/
1. Create project
2. Credentials → OAuth 2.0 Client ID
3. Add URIs: `http://localhost:4200`, `http://localhost:3000`
4. Copy your Client ID

### Step 2️⃣ Update Configuration Files

**frontend/src/app/pages/login/login.page.html (line ~73):**
```html
data-client_id="YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com"
```

**backend/.env (line 12):**
```
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com
```

### Step 3️⃣ Install & Run
```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend (new terminal)
cd frontend
npm start
```

---

## How It Works

```
👤 User clicks "Continue with Google"
   ↓
🔐 Authenticates with Google
   ↓
📱 Token sent to backend
   ↓
✅ Backend verifies with Google
   ↓
👤 User created OR logged in
   ↓
🎟️  JWT tokens issued
   ↓
📍 Redirect to dashboard
```

---

## User Account Creation

**First-time Google login:**
- Account created automatically
- Email: from Google account
- Username: email prefix (e.g., "john" from john@gmail.com)
- User Type: **freelancer** (default)
- Name: from Google profile

**Returning Google login:**
- Existing account used
- Current settings preserved

---

## Files Modified

| File | Changes |
|------|---------|
| `frontend/src/app/pages/login/login.page.ts` | Added Google handler + method |
| `frontend/src/app/pages/login/login.page.html` | Added Google widget |
| `frontend/src/app/services/auth.ts` | Added `loginWithGoogle()` |
| `frontend/src/app/services/api.service.ts` | Added Google interfaces + method |
| `backend/routes.py` | Added `/api/login-google` endpoint |
| `backend/requirements.txt` | Added `google-auth-oauthlib` |
| `backend/.env` | Added `GOOGLE_CLIENT_ID` variable |

---

## Testing

1. Visit http://localhost:4200/login
2. See "Continue with Google" button below email/password fields
3. Click button → Google popup
4. Sign in with Google account
5. Should redirect to appropriate dashboard

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Button not showing | Reload page, check console (F12) |
| "Invalid Client" error | GOOGLE_CLIENT_ID mismatch |
| CORS error | Check backend is running |
| "Token invalid" | Verify Google Client ID in .env |

---

## Environment Variables

```env
# Backend/.env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

**Status:** ✅ Ready to Use!

Once you add your Google Client ID, the integration is complete.
