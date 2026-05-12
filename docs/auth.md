# Authentication Flow

## Better Auth Integration

Better Auth is installed on the server and configured with the MongoDB adapter. It handles:

1. **Registration**: Creates user, sends verification email via Resend
2. **Email Verification**: User clicks link in email → token validated → account activated
3. **Login**: Validates credentials → creates session → sets httpOnly cookies
4. **Password Reset**: Sends reset link → user sets new password
5. **Session Management**: Access + refresh token pattern with rotation

## Security Measures

- Passwords hashed with bcrypt
- httpOnly cookies prevent XSS attacks
- SameSite strict prevents CSRF
- Rate limiting on auth endpoints (10 requests per 15 minutes)
- Token rotation on refresh (old token invalidated)
- Email verification required before full access

## Client-side Auth

- `authSlice` in Redux tracks current user + isAuthenticated
- `ProtectedRoute` component redirects unauthenticated users to login
- On app mount, `/auth/me` is called to restore session from cookie
- Login/Register pages redirect to feed after successful auth
