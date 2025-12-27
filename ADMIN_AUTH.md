# Admin Authentication System

## Overview
The admin dashboard is now protected with authentication. Users must login with specific credentials to access admin pages.

## Login Credentials

Create a user with `role=admin` in the database and login with that user's email + password.

## Access Points

### Admin Login Page
- **URL:** `/admin/login`
- **Features:**
  - Clean, modern login interface
  - Form validation
  - Error handling
  - Auto-redirect if already authenticated
  - Demo credentials displayed on page

### Admin Dashboard
- **URL:** `/admin`
- **Protected:** Yes - requires authentication
- **Auto-redirect:** Unauthenticated users are redirected to `/admin/login`

## Protected Routes

All admin routes are protected:
- `/admin` - Dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/customers` - Customer list
- `/admin/reports` - Reports and analytics

## Features

### Authentication Flow
1. User visits any `/admin/*` route
2. System checks authentication status
3. If not authenticated → redirects to `/admin/login`
4. User enters credentials
5. On success → redirects to `/admin` dashboard
6. Session stored in localStorage

### Logout Functionality
- Logout button in admin sidebar
- Clears authentication tokens
- Redirects to login page

### Session Management
- Uses localStorage for session persistence
- Survives page refreshes
- Can be cleared via logout

## Security Notes

⚠️ **Current Implementation:**
- Uses client-side authentication (localStorage)
- Credentials are hardcoded (for demo purposes)
- Suitable for development/demo environments

🔒 **For Production:**
- Implement server-side authentication
- Use secure session tokens (JWT)
- Hash passwords
- Add rate limiting
- Use HTTPS
- Implement proper session management

## Usage

1. Navigate to `/admin/login`
2. Enter credentials:
   - Email: your admin user's email
   - Password: your admin user's password
3. Click "Login"
4. You'll be redirected to the admin dashboard
5. Access all admin features

## Files Modified/Created

- `app/admin/login/page.tsx` - Login page
- `app/admin/layout.tsx` - Protected layout with auth check
- `lib/auth.ts` - Authentication utilities
- `app/admin/page.tsx` - Dashboard with auth check

