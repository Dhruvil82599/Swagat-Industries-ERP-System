# PHASE 6.5 — LOGIN & AUTHENTICATION

## OBJECTIVE

Add a professional, modern, animated, and secure Login & Authentication system to the existing Swagat Industries ERP.

IMPORTANT:

- Phase 1–6 are already completed and working.
- Do NOT rebuild completed phases.
- Do NOT unnecessarily modify existing functionality.
- Do NOT break existing Customer, Industry, Site, Shutter, Quotation, Calculation, Search, or Edit functionality.
- This phase is ONLY for Login & Authentication.
- Do NOT start Phase 7 automatically.
- Complete this phase, test it, report it, and STOP.

==================================================

1. # FIRST INSPECT THE EXISTING PROJECT

Before making changes:

- Inspect the existing frontend structure.
- Inspect the existing backend structure.
- Inspect Prisma schema.
- Inspect PostgreSQL configuration.
- Inspect existing React Router configuration.
- Inspect existing layout/header/sidebar.
- Inspect existing API structure.

Integrate authentication into the existing architecture.

Do NOT create duplicate structures.

Do NOT unnecessarily rewrite existing files.

================================================== 2. OFFICIAL SWAGAT INDUSTRIES LOGO
==================================================

The official logo is already available at:

frontend/public/Swagat-industries-logo-PNG-scaled-1-300x141.png

Use this exact logo.

DO NOT:

- Recreate the logo.
- Redesign the logo.
- Recolor the logo.
- Crop the logo.
- Distort the logo.
- Replace it with another logo.

Use the original logo as provided.

================================================== 3. LOGIN PAGE
==================================================

Create a professional Login Page for:

Swagat Industries ERP

The Login Page should include:

- Official Swagat Industries logo.
- Swagat Industries branding.
- ERP title.
- Professional welcome/sign-in message.
- Username field.
- Password field.
- Show/Hide Password functionality.
- Login button.
- Loading state.
- Error message area.

The page must be clean and easy to understand.

Do NOT add unnecessary fields.

================================================== 4. LOGIN PAGE DESIGN
==================================================

Design style:

- Modern
- Professional
- Clean
- Minimal
- Premium
- Industrial
- Business-oriented

The Login Page should visually match the rest of the ERP.

Use a centered login card with:

- White surface.
- Subtle border.
- Soft shadow.
- Moderate border radius.
- Proper spacing.
- Professional typography.

Background should use a subtle industrial-inspired visual treatment.

Do NOT use random stock images.

Do NOT make the page overly decorative.

Do NOT use excessive gradients.

================================================== 5. APPROVED COLOR PALETTE
==================================================

Use the approved Swagat Industries color palette:

Primary:
#123B5D

Primary Dark:
#0B2239

Primary Hover:
#0D2D46

Accent:
#F28C28

Accent Hover:
#D96F0B

Background:
#F5F7FA

Surface:
#FFFFFF

Text Primary:
#172B3A

Text Secondary:
#64748B

Border:
#E2E8F0

Success:
#16A34A

Warning:
#F59E0B

Danger:
#DC2626

Info:
#2563EB

IMPORTANT:

- Use CSS variables globally.
- Use these colors consistently.
- Do NOT introduce random colors.
- Do NOT change the approved palette.
- Use Accent mainly for highlights and important UI states.
- Keep the overall design professional.

================================================== 6. LOGIN PAGE ANIMATIONS
==================================================

Add smooth and professional animations.

Animations should feel premium but subtle.

Do NOT make the ERP look like a gaming website.

### Page Load Animation

On page load:

- Background fades in smoothly.
- Login card fades in and moves slightly upward.
- Logo gently fades/scales into position.
- Heading and subtitle appear smoothly.

### Form Animation

Username and password fields should appear with a subtle staggered animation.

### Input Focus Animation

When an input receives focus:

- Border transitions smoothly.
- Focus state appears.
- Use subtle transition effects.

### Button Animation

On hover:

- Smooth background color transition.
- Very subtle lift effect.

On click:

- Subtle pressed effect.

### Password Toggle

Show/Hide password icon should transition smoothly.

### Login Loading

While authentication is processing:

- Disable Login button.
- Show spinner.
- Display:

"Signing in..."

### Error Animation

Invalid login/error message should appear using a subtle fade/slide animation.

IMPORTANT:

Use lightweight CSS transitions/keyframes where possible.

Avoid:

- Excessive bouncing.
- Flashing.
- Continuous animations.
- Large scaling.
- Particle effects.
- Heavy animation libraries unless already installed and required.

================================================== 7. RESPONSIVE DESIGN
==================================================

Login Page must work properly on:

- Desktop
- Laptop
- Tablet
- Mobile

Requirements:

- No horizontal scrolling.
- Login card must fit smaller screens.
- Logo must scale correctly.
- Inputs must remain usable.
- Buttons must remain accessible.
- Background decoration should reduce on small screens if necessary.

================================================== 8. FORM VALIDATION
==================================================

Username:

- Required.

Password:

- Required.

Show clear validation messages.

Examples:

"Username is required."

"Password is required."

Do not call the backend if required fields are empty.

Support pressing Enter to submit the login form.

================================================== 9. AUTHENTICATION DATABASE
==================================================

Use the existing:

PostgreSQL

- Prisma

Create only the database structure required for authentication.

Create a user/admin table with appropriate fields, for example:

- id
- username
- passwordHash
- createdAt
- updatedAt

Add appropriate constraints/indexes.

Username should be unique.

DO NOT store plain-text passwords.

================================================== 10. INITIAL ADMIN USER SETUP
==================================================

Implement a secure way to create the first admin user for local development.

Use a Prisma seed script or equivalent existing Prisma setup.

Initial credentials must come from environment variables.

Example:

ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

IMPORTANT:

- Never hardcode the real password.
- Never commit a real password to Git.
- Never expose ADMIN_PASSWORD to frontend code.
- Never store the plain-text password in PostgreSQL.
- Hash the password before storing it.
- If the admin already exists, do not create a duplicate user.
- Make the seed process safe to run again.

Document the command required to create the initial admin user.

The normal application flow after setup must be:

Initial Admin Setup
↓
Login Page
↓
Authentication
↓
Dashboard

Do NOT create a permanent first-time setup page.

================================================== 11. PASSWORD SECURITY
==================================================

Passwords must be securely hashed using a suitable password hashing library/approach compatible with the existing Node.js backend.

Never store:

- Plain password
- Plain-text password
- Password in frontend source code

Never return:

- password
- passwordHash

in API responses.

================================================== 12. LOGIN API
==================================================

Create:

POST /api/auth/login

Use the existing backend API architecture.

Request:

{
"username": "...",
"password": "..."
}

Backend must:

1. Validate request.
2. Find user.
3. Verify password hash.
4. Create authenticated state/token/session.
5. Return required authentication information only.

For invalid credentials, return a safe generic message.

Example:

"Invalid username or password."

Do NOT reveal whether the username or password was specifically incorrect.

================================================== 13. AUTHENTICATION METHOD
==================================================

Use a secure authentication mechanism appropriate for the existing local React + Express application.

Keep the implementation simple and maintainable.

If JWT is used:

- Secret must be stored in .env.
- Never hardcode JWT secret.
- Never expose JWT secret to frontend.
- Use an appropriate expiration.
- Protect backend routes with authentication middleware.

If HTTP-only cookies/session are used:

- Follow secure cookie/session practices.
- Do not expose sensitive authentication information to frontend unnecessarily.

Choose the approach that fits the existing project architecture best.

Do NOT add unnecessary authentication complexity.

================================================== 14. PROTECTED FRONTEND ROUTES
==================================================

Protect all existing ERP application routes.

Unauthenticated users:

- Must not access ERP pages.
- Must be redirected to:

/login

Authenticated users:

- Can access the existing ERP application.

Expected flow:

/login
↓
Successful Authentication
↓
Dashboard
↓
Existing ERP Modules

Do NOT rebuild the existing routing system unnecessarily.

Integrate authentication into the current React Router structure.

================================================== 15. PROTECTED BACKEND APIs
==================================================

Authentication must also be enforced on backend APIs where appropriate.

Do not rely only on frontend route protection.

The backend must verify authentication before allowing protected ERP operations.

Do not allow an unauthenticated user to bypass the frontend and directly call protected APIs.

Do not expose unnecessary public APIs.

================================================== 16. AUTHENTICATED USER STATE
==================================================

Handle authentication state properly.

When the page is refreshed:

- Maintain authentication if the session/token is still valid.

If authentication is invalid or expired:

- Redirect to Login.

Avoid:

- Infinite redirect loops.
- Broken refresh behavior.
- Flickering between Login and Dashboard.

================================================== 17. LOGOUT
==================================================

Add Logout functionality to the existing ERP header/layout.

On Logout:

1. Clear authentication.
2. Clear session/token according to the chosen authentication method.
3. Redirect to /login.
4. Prevent access to protected routes.

Logout should work without breaking the application.

================================================== 18. LOGIN PAGE WHEN ALREADY AUTHENTICATED
==================================================

If an authenticated user tries to open:

/login

redirect them to the existing Dashboard.

Do not show the Login Page unnecessarily.

================================================== 19. ERROR HANDLING
==================================================

Handle:

- Empty username.
- Empty password.
- Invalid credentials.
- Server unavailable.
- API error.
- Expired authentication.
- Invalid authentication.
- Unexpected backend errors.

Show clear user-friendly messages.

Do NOT expose:

- Stack traces.
- SQL errors.
- Database errors.
- Internal server details.
- Password hashes.
- Sensitive authentication information.

================================================== 20. ENVIRONMENT & SECURITY
==================================================

Use .env for sensitive configuration.

Examples:

DATABASE_URL=...
JWT_SECRET=...
ADMIN_USERNAME=...
ADMIN_PASSWORD=...

Do not hardcode sensitive values.

Ensure .env is included in .gitignore.

Never expose backend environment variables through Vite frontend variables unless explicitly required and safe.

================================================== 21. DO NOT ADD
==================================================

Do NOT implement:

- Roles.
- Permissions.
- Multi-user management.
- Employee management.
- Forgot Password.
- OTP.
- Email verification.
- Social Login.
- Google Login.
- Microsoft Login.
- Two-factor authentication.
- User profile management.
- Cloud authentication.
- Complex user management.

Keep authentication simple for the current local ERP.

================================================== 22. EXISTING FUNCTIONALITY MUST REMAIN SAFE
==================================================

Do NOT change existing business logic.

Do NOT break:

- Customer management.
- Industry/Company management.
- Site management.
- Shutter management.
- Shutter calculations.
- Quotation creation.
- Quotation editing.
- Quotation search.
- Quotation numbering.
- Existing database relationships.
- Existing APIs.

Only make changes required for authentication integration.

================================================== 23. CODE QUALITY
==================================================

Follow the existing project architecture.

Use:

- Reusable React components.
- Clean API functions.
- Authentication middleware.
- Proper error handling.
- Clear naming.
- Maintainable code.

Avoid unnecessary dependencies.

Do not duplicate components.

Do not unnecessarily rewrite working code.

================================================== 24. ACCESSIBILITY
==================================================

Login page must have:

- Proper labels.
- Keyboard navigation.
- Visible focus states.
- Accessible buttons.
- Correct input types.
- Meaningful error messages.

The complete login form should be usable with keyboard navigation.

================================================== 25. PERFORMANCE
==================================================

Keep the Login Page lightweight.

Use CSS animations where possible.

Do not add a large animation library just for simple effects.

Animations should not negatively affect page performance.

================================================== 26. TESTING
==================================================

Before completing Phase 6.5, test all of the following.

### LOGIN UI

- Logo displays correctly.
- Logo is not distorted.
- Username field works.
- Password field works.
- Show/Hide password works.
- Login button works.
- Loading state works.
- Error animation works.
- Input focus works.
- Button hover works.
- Page-load animation works.
- Responsive layout works.

### VALIDATION

- Empty username.
- Empty password.
- Both fields empty.
- Valid input.

### INITIAL ADMIN

- Initial admin can be created.
- Password is hashed.
- Plain-text password is not stored.
- Duplicate admin is not created.
- Seed process works correctly.

### AUTHENTICATION

- Valid credentials.
- Invalid username.
- Invalid password.
- Invalid credentials message.
- Successful login.
- Dashboard redirect.
- Backend authentication works.

### PROTECTED ROUTES

Without login, test direct access to:

- Dashboard.
- Customers.
- Industries.
- Sites.
- Shutters.
- Quotations.
- Payments.

All protected pages should redirect to Login.

### REFRESH

- Refresh while authenticated.
- Refresh after logout.
- Invalid/expired authentication.

### LOGOUT

- Logout works.
- Authentication is cleared.
- Redirect to Login.
- Protected pages cannot be accessed after logout.

### API SECURITY

- Unauthenticated API request is rejected.
- Authenticated API request works.
- Invalid authentication is rejected.

### EXISTING ERP

Verify important Phase 1–6 functionality remains working.

================================================== 27. FINAL VISUAL CHECK
==================================================

Before completing Phase 6.5, visually inspect the Login Page.

Check:

- Official logo size.
- Logo quality.
- Alignment.
- Spacing.
- Typography.
- Input design.
- Button design.
- Card position.
- Responsive layout.
- Animation smoothness.
- Hover states.
- Focus states.
- Error states.
- Loading state.

The final Login Page should look like a professional industrial ERP application.

================================================== 28. PHASE COMPLETION
==================================================

After completing Phase 6.5, provide:

PHASE STATUS:
Completed / Issues

SUMMARY:
Short summary of Login & Authentication implementation.

FILES CREATED:
List all created files.

FILES MODIFIED:
List all modified files.

DATABASE CHANGES:
Explain authentication-related database changes.

API CHANGES:
Explain authentication API and middleware.

ROUTING CHANGES:
Explain protected route changes.

SECURITY:
Explain password hashing and authentication approach.

INITIAL ADMIN SETUP:
Explain how the initial admin is created.

ANIMATIONS:
List implemented animations.

TESTING:
List tests performed and their results.

EXISTING FUNCTIONALITY:
Confirm that Phase 1–6 functionality remains working.

ISSUES:
List remaining issues, if any.

================================================== 29. CAPTCHA CODE VERIFICATION
==================================================

To enhance security and protect against automated login attempts, an interactive CAPTCHA verification code is integrated into the Login Form:

### CAPTCHA Generator & Visual Styling
- Uses dynamic HTML5 `<canvas>` rendering (150px × 42px) to generate a 6-character random alphanumeric CAPTCHA challenge string.
- Applies visual noise distortion (random background line strokes and noise dots) plus subtle character rotation (-10° to +10°) to prevent OCR bot scraping.
- Uses official Swagat ERP primary color `#123B5D` for challenge typography.

### Interactive Reload & Validation
- Includes an inline refresh button (`FiRefreshCw` icon) allowing users to generate a fresh CAPTCHA challenge at any time.
- Enforces case-insensitive validation before form submission.
- On invalid CAPTCHA input, displays a clear red alert (`✕ Invalid CAPTCHA code. Please try again.`), clears the user CAPTCHA field, and automatically regenerates a new CAPTCHA challenge.

### Full-Stack Security Parity
- Backend `authController.js` validates CAPTCHA parameter presence in authentication requests, rejecting unverified login attempts with `400 Bad Request`.

================================================== 30. FORGOT PASSWORD ASSISTANCE
==================================================

To assist users who have forgotten their credentials while maintaining ERP security standards:

### Interactive Login Form Link
- Positioned right-aligned within the Password input field header in `LoginPage.jsx`.
- Styled with primary color `#123B5D`, smooth font sizing (12.5px), and dynamic hover accent shift (`#F28C28`).

### Administrative Guidance Modal
- Clicking "Forgot password?" triggers a modern, accessible modal overlay (`Forgot Password Assistance`) featuring:
  - Security key icon (`FiKey`) and close button (`FiX`).
  - Clear administrative instructions: "For security compliance, password resets must be executed by a System Administrator. Please contact your administrator or update the environment credentials (`ADMIN_PASSWORD`)."
  - Interactive "Got it" action button to dismiss the modal cleanly.

================================================== 31. HEADER PROFILE DROPDOWN & CHANGE PASSWORD
==================================================

To streamline application navigation and security management across the top header bar:

### Unified Header Profile Section Trigger
- Replaces individual top-right buttons in `Navbar.jsx` with a single, elegant User Profile Section trigger (`.profile-menu-trigger`).
- Renders the active user avatar (initial letter in `#123B5D` badge), username, role (`ADMIN`), and an animated dropdown arrow (`FiChevronDown`).
- Includes outside-click detection to automatically close the dropdown menu when clicking elsewhere.

### Dropdown Menu Options
Clicking the profile trigger opens a smooth dropdown menu containing:
1. ⚙️ **Company Settings** (`FiSettings` icon) — Direct navigation shortcut to `/company-settings`.
2. 🔑 **Change Password** (`FiKey` icon) — Triggers the interactive Change Password modal overlay.
3. 🚪 **Log Out** (`FiLogOut` icon) — Red-highlighted action triggering the session logout confirmation modal.

### Change Password Modal & Backend API
- **Modal Overlay**: Features Current Password, New Password (minimum 6 characters), and Confirm New Password input fields with eye-icon visibility toggles (`FiEye`/`FiEyeOff`).
- **Backend Security Controller (`POST /api/auth/change-password`)**: Protected with `authMiddleware`. Verifies the user's current password against the stored bcrypt hash in PostgreSQL, hashes the new password, and updates the user record via Prisma.



