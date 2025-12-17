'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Heart, Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isUserAuthenticated, getUser, logoutUser } from '@/lib/userAuth';
import { getCartCount } from '@/lib/cart';
import { getWishlistCount } from '@/lib/wishlist';
import { allProducts } from '@/lib/products';
import SearchModal from './SearchModal';

export default function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(isUserAuthenticated());
      setUser(getUser());
    };
    checkAuth();
    // Check auth on storage changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    const updateCounts = () => {
      setCartCount(getCartCount());
      setWishlistCount(getWishlistCount());
    };
    updateCounts();
    window.addEventListener('cartUpdated', updateCounts);
    window.addEventListener('wishlistUpdated', updateCounts);
    return () => {
      window.removeEventListener('cartUpdated', updateCounts);
      window.removeEventListener('wishlistUpdated', updateCounts);
    };
  }, []);

  useEffect(() => {
    // Close account menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isAccountMenuOpen && !target.closest('.account-menu-container')) {
        setIsAccountMenuOpen(false);
        setIsScrolled(window.scrollY > 20);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-luxury ${isScrolled
          ? 'glass-effect shadow-luxury py-3'
          : 'bg-surface/95 backdrop-blur-sm py-5'
        }`}
    >
      <div className="container-max px-4 sm:px-6 lg:px-8 xl:px-20">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl md:text-3xl font-display font-bold text-accent tracking-tight">
            DROVIA
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            <Link
              href="/"
              className="text-[15px] text-text-primary hover:text-accent transition-colors duration-300 font-medium tracking-wide"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="text-[15px] text-text-primary hover:text-accent transition-colors duration-300 font-medium tracking-wide"
            >
              Shop
            </Link>
            <Link
              href="/contact"
              className="text-[15px] text-text-primary hover:text-accent transition-colors duration-300 font-medium tracking-wide"
            >
              Contact
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 hover:bg-ivory rounded-xl transition-all duration-300 group"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-text-primary group-hover:text-accent transition-colors duration-300" />
            </button>
            <Link
              href="/wishlist"
              className="p-2.5 hover:bg-ivory rounded-xl transition-all duration-300 relative group"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-text-primary group-hover:text-accent transition-colors duration-300" />
              {wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-accent text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-medium"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </Link>
            <Link
              href="/cart"
              className="p-2.5 hover:bg-ivory rounded-xl transition-all duration-300 relative group"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-text-primary group-hover:text-accent transition-colors duration-300" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-accent text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-medium"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* Account Menu */}
            {isLoggedIn ? (
              <div className="relative account-menu-container">
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="flex items-center gap-2 p-2.5 hover:bg-ivory rounded-xl transition-all duration-300 group"
                  aria-label="Account menu"
                >
                  <User className="w-5 h-5 text-text-primary group-hover:text-accent transition-colors duration-300" />
                  <span className="hidden md:block text-text-primary font-medium text-[15px]">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 text-text-primary hidden md:block transition-transform duration-300 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isAccountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 bg-surface rounded-2xl shadow-luxury border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-5 border-b border-gray-100">
                        <p className="font-semibold text-text-primary text-[15px]">{user?.name}</p>
                        <p className="text-sm text-text-muted mt-1">{user?.email}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-ivory transition-colors duration-300 group"
                      >
                        <User className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors duration-300" />
                        <span className="text-text-primary text-[15px]">My Account</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-ivory transition-colors duration-300 text-left group"
                      >
                        <LogOut className="w-4 h-4 text-error group-hover:text-error/80 transition-colors duration-300" />
                        <span className="text-error text-[15px]">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 hover:bg-ivory rounded-xl transition-all duration-300 group"
              >
                <User className="w-5 h-5 text-text-primary group-hover:text-accent transition-colors duration-300" />
                <span className="text-text-primary font-medium text-[15px]">Login</span>
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 hover:bg-ivory rounded-xl transition-all duration-300"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-text-primary" />
              ) : (
                <Menu className="w-5 h-5 text-text-primary" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-gray-100 bg-surface/98 backdrop-blur-sm"
          >
            <nav className="px-4 sm:px-6 lg:px-8 xl:px-20 py-6 flex flex-col gap-3">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-text-primary hover:text-accent transition-colors duration-300 font-medium text-[15px] py-2"
              >
                Home
              </Link>
              <Link
                href="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-text-primary hover:text-accent transition-colors duration-300 font-medium text-[15px] py-2"
              >
                Shop
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-text-primary hover:text-accent transition-colors duration-300 font-medium text-[15px] py-2"
              >
                Contact
              </Link>
              {isLoggedIn ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-text-primary hover:text-accent transition-colors duration-300 font-medium text-[15px] py-2"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left text-error hover:text-error/80 transition-colors duration-300 font-medium text-[15px] py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-text-primary hover:text-accent transition-colors duration-300 font-medium text-[15px] py-2"
                >
                  Login
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={allProducts}
      />
    </header>
  );
}

