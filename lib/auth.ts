'use client';

export const isAdminAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('adminAuth') === 'true';
};

export const logoutAdmin = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('adminAuth');
  localStorage.removeItem('adminUser');
  window.location.href = '/admin/login';
};

export const getAdminUser = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminUser');
};

