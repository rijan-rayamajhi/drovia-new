# Test Credentials

This document contains all the test credentials for the e-commerce website.

## 🔐 Unified Login System

**Access URL:** `/login`

The system automatically detects whether you're logging in as a **User** or **Admin** based on your credentials:
- **Email addresses** (contains `@`) → User Portal
- **Usernames** (no `@`) → Admin Dashboard

---

## 👤 User Portal Account

**Credentials:**
- **Email:** `user@demo.com`
- **Password:** `user123`

**Access:** After login, redirected to User Portal (homepage)

**Features:**
- Browse and shop products
- Add items to cart
- Complete checkout
- View account details at `/account`
- View order history

---

## 🔐 Admin Dashboard Account

**Credentials:**
- **Username:** `admin`
- **Password:** `admin123`

**Access:** After login, redirected to Admin Dashboard at `/admin`

**Features:**
- Access to admin dashboard
- Manage products (`/admin/products`)
- View and manage orders (`/admin/orders`)
- View customers (`/admin/customers`)
- View reports and analytics (`/admin/reports`)

---

## 📝 Quick Test Guide

### Testing User Portal:
1. Navigate to `/login`
2. Enter email: `user@demo.com`
3. Enter password: `user123`
4. Click "Login"
5. You'll be redirected to the homepage
6. You can now shop, add to cart, and checkout

### Testing Admin Dashboard:
1. Navigate to `/login`
2. Enter username: `admin` (no email format)
3. Enter password: `admin123`
4. Click "Login"
5. You'll be redirected to `/admin` dashboard
6. Access all admin features

### Testing Checkout Flow:
1. Login as user (`user@demo.com` / `user123`)
2. Add items to cart
3. Go to cart page
4. Click "Proceed to Checkout"
5. Complete checkout form (pre-filled with user data)
6. Place order

---

## 🎯 Smart Detection

The unified login page automatically detects account type:

- **Type "user@demo.com"** → Shows "Email Address" label with email icon
- **Type "admin"** → Shows "Username" label with shield icon
- **Empty field** → Shows "Email or Username" label

---

## 🔄 Registration

You can also create a new user account:
1. Navigate to `/register`
2. Fill in the registration form
3. Click "Sign Up"
4. You'll be automatically logged in

---

## 📍 Alternative Routes

- **Old Admin Login:** `/admin/login` → Automatically redirects to `/login`
- **User Login:** `/login` → Unified login page
- **User Registration:** `/register` → Create new user account

---

**Note:** These are demo credentials for testing purposes only. In production, implement proper authentication with secure password hashing and server-side validation.
