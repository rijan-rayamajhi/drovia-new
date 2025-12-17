'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import DroviaHeader from '@/components/DroviaHeader';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Lock, Mail, User, Shield } from 'lucide-react';
import { isUserAuthenticated, loginUser } from '@/lib/userAuth';
import { isAdminAuthenticated } from '@/lib/auth';

// Demo credentials
const DEMO_USER = {
  email: 'user@demo.com',
  password: 'user123',
  name: 'Demo User',
  phone: '+91 98765 43210',
};

const DEMO_ADMIN = {
  username: 'admin',
  password: 'admin123',
};

function UnifiedLoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getSafeRedirect = (value: string | null): string => {
    if (!value) return '/';
    const trimmed = value.trim();
    if (!trimmed.startsWith('/')) return '/';
    if (trimmed.startsWith('//')) return '/';
    if (trimmed.includes('://')) return '/';
    return trimmed;
  };

  const rawRedirect = searchParams.get('redirect');
  const redirectTo = getSafeRedirect(rawRedirect);
  const hasExplicitRedirect = !!rawRedirect;
  
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'user' | 'admin' | null>(null);

  useEffect(() => {
    // Check if already authenticated
    if (isUserAuthenticated()) {
      router.push(redirectTo);
    } else if (isAdminAuthenticated() && !hasExplicitRedirect) {
      router.push('/admin');
    }
  }, [router, redirectTo, hasExplicitRedirect]);

  // Detect login type based on input
  useEffect(() => {
    const input = formData.emailOrUsername.trim();
    if (input.includes('@')) {
      setLoginType('user');
    } else if (input.length > 0) {
      setLoginType('admin');
    } else {
      setLoginType(null);
    }
  }, [formData.emailOrUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const emailOrUsername = formData.emailOrUsername.trim();
    const password = formData.password.trim();

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      // Check if it's admin credentials
      if (
        emailOrUsername === DEMO_ADMIN.username &&
        password === DEMO_ADMIN.password
      ) {
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminUser', emailOrUsername);
        
        if (localStorage.getItem('adminAuth') === 'true') {
          window.location.href = '/admin';
          return;
        } else {
          setError('Failed to save authentication. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Check if it's user credentials
      if (
        emailOrUsername === DEMO_USER.email &&
        password === DEMO_USER.password
      ) {
        loginUser({
          id: Date.now().toString(),
          name: DEMO_USER.name,
          email: DEMO_USER.email,
          phone: DEMO_USER.phone,
        });
        router.push(redirectTo);
        return;
      }

      // Invalid credentials
      setError('Invalid credentials. Please check your email/username and password.');
      setLoading(false);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <DroviaHeader />
      <div className="mt-20 section-padding py-16">
        <div className="container-max max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-medium p-8"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-text mb-2">Login</h1>
              <p className="text-text-light">Sign in to your account or admin dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email-username" className="block text-sm font-medium text-text mb-2">
                  {loginType === 'user' ? (
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </span>
                  ) : loginType === 'admin' ? (
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Username
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Email or Username
                    </span>
                  )}
                </label>
                <div className="relative">
                  {loginType === 'user' ? (
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light" />
                  ) : loginType === 'admin' ? (
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light" />
                  ) : (
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light" />
                  )}
                  <input
                    id="email-username"
                    type="text"
                    name="emailOrUsername"
                    value={formData.emailOrUsername}
                    onChange={(e) => setFormData({ ...formData, emailOrUsername: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={loginType === 'user' ? 'Enter your email' : loginType === 'admin' ? 'Enter username' : 'Enter email or username'}
                    autoComplete="username"
                    required
                  />
                </div>
                {loginType && (
                  <p className="text-xs text-text-light mt-1">
                    {loginType === 'user' ? '✓ User account detected' : '✓ Admin account detected'}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light" />
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full py-4"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-text-light text-sm">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User Portal Demo:
                </p>
                <div className="text-xs text-blue-800 space-y-1">
                  <p>Email: <code className="bg-white px-2 py-1 rounded">user@demo.com</code></p>
                  <p>Password: <code className="bg-white px-2 py-1 rounded">user123</code></p>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin Dashboard Demo:
                </p>
                <div className="text-xs text-purple-800 space-y-1">
                  <p>Username: <code className="bg-white px-2 py-1 rounded">admin</code></p>
                  <p>Password: <code className="bg-white px-2 py-1 rounded">admin123</code></p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function UnifiedLoginPage() {
  return (
    <Suspense fallback={null}>
      <UnifiedLoginPageInner />
    </Suspense>
  );
}

