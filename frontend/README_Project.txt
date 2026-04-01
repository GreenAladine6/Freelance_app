FREELANCE APP - FRONTEND DOCUMENTATION
=======================================

1. TECH STACK & SETUP (Ionic/Angular)
------------------------------------
- Framework: Ionic 7 / Angular 17+ (with standalone components).
- Logic: TypeScript.
- Assets: Google Fonts (Inter, Outfit), Lucide Icons / IonIcons.
- Run locally with: `ionic serve` or `npm start`.

2. CORE SERVICES (src/app/services)
-----------------------------------
These handle the logic across the entire app:

A. API SERVICE (api.service.ts)
   - Defines central `baseUrl` (http://localhost:5000/api).
   - Functions: getFreelancers(), getProfile(), updateProfile(), getConversations(), sendMessage(), getProducts(), etc.
   - It handles all HTTP methods (GET, POST, PUT, DELETE).

B. AUTH SERVICE (auth.ts)
   - Handles the login/logout flow.
   - It wraps API authentication and uses the RoleService to handle the tokens.

C. ROLE SERVICE (role.service.ts)
   - The "brain" of user status.
   - It persists the `access_token` and `user` object in `localStorage`.
   - Property `isAuthenticated`: Checks if a user is logged in.
   - Property `role`: Determines if the user sees the Admin, Client, or Freelancer dashboard.

3. SECURITY & ROUTING (app-routing.module.ts)
--------------------------------------------
- AUTH GUARD: Protects sensitive pages like /dashboard, /chat, and /profile.
- AUTH INTERCEPTOR: A background service that automatically adds the JWT 'Bearer' token to every API request header. If an API returns a 401 error, it automatically logs the user out.

4. KEY FEATURES & PAGES
----------------------

A. CHAT SYSTEM (pages/chat)
   - Uses real-time POLLING.
   - Every 3 seconds, the page fetches the newest messages from /api/conversations/<id>/messages.
   - Supports clicking on the header to view the other person's profile.

B. DASHBOARD LOGIC (pages/dashboard)
   - There are 3 dashboards:
     - DashboardAdmin: Platform-wide stats (User counts, Job counts).
     - DashboardClient: Featured freelancers and quick job posting.
     - Dashboard (Freelancer): Application status and new job opportunities.

C. CV MANAGEMENT (pages/freelancer-profile)
   - Profile items (Education, Experience) are stored as arrays.
   - When editing the profile, the 'handleSave' function sends a PUT request to the backend.

D. STORE (pages/store)
   - A marketplace for digital products.
   - Uses categories (Templates, Icons, etc.) to filter items live from the API.

5. HOW TO NAVIGATE
------------------
- SPLASH SCREEN: First thing everyone sees. Automatically redirects:
  - Already Logged In -> Dashboard (based on role).
  - Guest -> Interests Page (Role Selection).
- BOTTOM NAV: Central navigation for Browsing, Gigs, Chat, and Profile.
