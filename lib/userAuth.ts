'use client';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export const isUserAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('userAuth') === 'true';
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const loginUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('userAuth', 'true');
  localStorage.setItem('user', JSON.stringify(user));
};

export const logoutUser = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    // Call API to clear cookie
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout API error:', error);
  }

  localStorage.removeItem('userAuth');
  localStorage.removeItem('user');
  localStorage.removeItem('cartItems');
  localStorage.removeItem('wishlistItems');
  localStorage.removeItem('userWallet');

  // Dispatch event to update UI components
  window.dispatchEvent(new Event('storage'));
};

export const registerUser = (userData: { name: string; email: string; password: string; phone?: string }): User => {
  const user: User = {
    id: Date.now().toString(),
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
  };
  loginUser(user);
  return user;
};

