# User Authentication System

## Overview
User authentication has been implemented to protect checkout and provide account management features.

## Features Implemented

### 1. User Login & Registration
- **Login Page:** `/login`
- **Register Page:** `/register`
- **Demo Accounts:**
  - Email: `user@example.com` | Password: `user123`
  - Email: `test@example.com` | Password: `test123`

### 2. Protected Checkout
- Checkout page (`/checkout`) requires authentication
- Unauthenticated users are redirected to `/login?redirect=/checkout`
- After login, users are redirected back to checkout
- Form is pre-filled with user information (name, phone)

### 3. Account Menu in Header
- **When Logged In:**
  - Shows user's first name with account icon
  - Dropdown menu with:
    - User name and email
    - "My Account" link
    - "Logout" button
- **When Not Logged In:**
  - Shows "Login" button
- **Mobile:** Account options in mobile menu

### 4. Account Page
- **URL:** `/account`
- **Features:**
  - Display user information (name, email, phone)
  - Order history section
  - Quick actions (Continue Shopping, View Cart, Logout)
- **Protected:** Requires authentication

## User Flow

### Checkout Flow
1. User adds items to cart
2. User clicks "Proceed to Checkout"
3. If not logged in → Redirected to `/login?redirect=/checkout`
4. User logs in → Redirected back to `/checkout`
5. Checkout form is pre-filled with user data
6. User completes checkout

### Account Management
1. User clicks account icon/name in header
2. Dropdown shows account options
3. User can:
   - View account details (`/account`)
   - Logout
   - Access cart

## Files Created/Modified

### Created:
- `lib/userAuth.ts` - User authentication utilities
- `app/login/page.tsx` - Login page
- `app/register/page.tsx` - Registration page
- `app/account/page.tsx` - Account page

### Modified:
- `components/Header.tsx` - Added account menu and login button
- `app/checkout/page.tsx` - Added authentication protection

## Authentication Methods

### Login
```typescript
loginUser(user: User)
```

### Logout
```typescript
logoutUser()
```

### Check Authentication
```typescript
isUserAuthenticated(): boolean
```

### Get User
```typescript
getUser(): User | null
```

## Security Notes

⚠️ **Current Implementation:**
- Uses client-side authentication (localStorage)
- Mock user database (for demo purposes)
- Suitable for development/demo environments

🔒 **For Production:**
- Implement server-side authentication
- Use secure session tokens (JWT)
- Hash passwords
- Use HTTPS
- Implement proper session management
- Add password reset functionality
- Add email verification

## Usage

1. **Register:** Navigate to `/register` and create an account
2. **Login:** Navigate to `/login` or click "Login" in header
3. **Checkout:** Must be logged in to checkout
4. **Account:** Click account icon → "My Account"
5. **Logout:** Click account icon → "Logout"

