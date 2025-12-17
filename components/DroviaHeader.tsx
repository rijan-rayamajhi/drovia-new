'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, ShoppingCart, Heart, Menu, X, User, LogOut, ChevronDown, Wallet } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { isUserAuthenticated, getUser, logoutUser } from '@/lib/userAuth';
import { getCartCount } from '@/lib/cart';
import { getWishlistCount } from '@/lib/wishlist';
import { getWalletBalance } from '@/lib/wallet';
import { getAdminProducts } from '@/lib/adminProducts';
import { Product } from '@/types';
import SearchModal from './SearchModal';


const navCategories = [
  {
    name: 'Men',
    href: '/shop?gender=men',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    subcategories: ['T-Shirts', 'Shirts', 'Jackets', 'Pants', 'Footwear'],
  },
  {
    name: 'Women',
    href: '/shop?gender=women',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    subcategories: ['Dresses', 'Tops', 'Jackets', 'Pants', 'Footwear'],
  },
  {
    name: 'Collection',
    href: '/collections',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    subcategories: ['Spring Collection', 'Summer Collection', 'Winter Collection'],
  },
  {
    name: 'New Arrivals',
    href: '/shop?sort=newest',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
  },
];

function DroviaHeaderInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [hoveredNavItem, setHoveredNavItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Check if a category is active
  const isCategoryActive = (href: string) => {
    if (href === '/collections' && pathname === '/collections') return true;
    if (href === '/new-arrivals' && pathname === '/new-arrivals') return true;
    if (href === '/sale' && pathname === '/sale') return true;
    if (href === '/shop/men' && pathname === '/shop/men') return true;
    if (href === '/shop/women' && pathname === '/shop/women') return true;
    if (href.startsWith('/shop') && pathname === '/shop') {
      const hrefParams = new URLSearchParams(href.split('?')[1] || '');
      const hrefGender = hrefParams.get('gender');
      const currentGender = searchParams.get('gender');
      // Check if gender matches
      if (hrefGender && currentGender === hrefGender) return true;
      // If href has no gender param and current has no gender param, it's the base shop page
      if (!hrefGender && !currentGender) return true;
    }
    return false;
  };

  // Spotlight effect
  const spotlightRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const checkAuth = () => {
      setIsLoggedIn(isUserAuthenticated());
      const userData = getUser();
      setUser(userData);
      if (userData) {
        // Fetch wallet from API
        fetch('/api/wallet')
          .then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed to fetch wallet');
          })
          .then(data => {
            setWalletBalance(data.balance || 0);
          })
          .catch(err => {
            // Fallback to local storage
            const userId = userData.email || userData.name;
            if (userId) {
              setWalletBalance(getWalletBalance(userId));
            }
          });
      }
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const updateCounts = async () => {
      setCartCount(await getCartCount());
      setWishlistCount(getWishlistCount());
      const userData = getUser();
      if (userData) {
        // Fetch wallet from API
        fetch('/api/wallet')
          .then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed to fetch wallet');
          })
          .then(data => {
            setWalletBalance(data.balance || 0);
          })
          .catch(err => {
            const userId = userData.email || userData.name;
            if (userId) {
              setWalletBalance(getWalletBalance(userId));
            }
          });
      }
    };
    updateCounts();
    window.addEventListener('cartUpdated', updateCounts);
    window.addEventListener('wishlistUpdated', updateCounts);
    window.addEventListener('walletUpdated', updateCounts);
    return () => {
      window.removeEventListener('cartUpdated', updateCounts);
      window.removeEventListener('wishlistUpdated', updateCounts);
      window.removeEventListener('walletUpdated', updateCounts);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        const rect = spotlightRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
    };
    const header = spotlightRef.current;
    if (header) {
      header.addEventListener('mousemove', handleMouseMove);
      return () => header.removeEventListener('mousemove', handleMouseMove);
    }
  }, [mounted, mouseX, mouseY]);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isAccountMenuOpen && !target.closest('.account-menu-container')) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAccountMenuOpen]);

  const handleLogout = async () => {
    await logoutUser();
    setIsLoggedIn(false);
    setUser(null);
    setIsAccountMenuOpen(false);
    // Force hard reload to ensure clean state
    window.location.href = '/';
  };

  return (
    <>
      <header
        ref={spotlightRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-[520ms] ease-luxury ${isScrolled
          ? 'py-3 shadow-luxury'
          : 'py-5 shadow-soft'
          }`}
      >
        {/* Glassmorphism Background */}
        <motion.div
          className="absolute inset-0 border-b border-gray-100/50"
          style={{
            background: isScrolled
              ? 'rgba(255, 255, 255, 0.9)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          transition={{ duration: 0.52 }}
        />

        {/* Spotlight Glow Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${x}px ${y}px, rgba(212, 175, 55, 0.15), transparent 40%)`,
            opacity: hoveredNavItem ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />

        <div className="container-max px-4 sm:px-6 lg:px-8 xl:px-20 relative z-10">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="relative transition-all duration-[520ms]"
            >
              <img
                src="/logo.png"
                alt="DROVIA"
                className={`transition-all duration-[520ms] object-contain ${isScrolled ? 'h-10 md:h-14' : 'h-12 md:h-20'
                  }`}
              />
            </Link>

            {/* Center Navigation */}
            <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              {navCategories.map((category) => {
                const isActive = isCategoryActive(category.href);
                const isHovered = hoveredNavItem === category.name;
                return (
                  <div
                    key={category.name}
                    className="relative"
                    onMouseEnter={() => setHoveredNavItem(category.name)}
                    onMouseLeave={() => setHoveredNavItem(null)}
                  >
                    <Link
                      href={category.href}
                      className={`relative text-[15px] font-medium tracking-wide py-2 transition-colors duration-300 ${isActive ? 'text-accent' : 'text-text-primary'
                        }`}
                      onClick={() => setHoveredNavItem(null)}
                    >
                      {category.name}
                      {/* Gold Animated Underline */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isHovered || isActive ? 1 : 0 }}
                        transition={{ duration: 0.3, ease: [0.2, 0.9, 0.12, 1] }}
                      />
                    </Link>
                  </div>
                );
              })}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 hover:bg-ivory/50 rounded-xl transition-all duration-300 group relative"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-text-primary group-hover:text-accent transition-colors duration-300" />
              </button>

              {/* Wallet/Points */}
              {mounted && isLoggedIn && (
                <Link
                  href="/account/wallet"
                  className="p-2.5 hover:bg-ivory/50 rounded-xl transition-all duration-300 group relative"
                  aria-label="Wallet"
                >
                  <Wallet className="w-5 h-5 text-text-primary group-hover:text-gold transition-colors duration-300" />
                  {walletBalance > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gold text-white text-xs font-semibold rounded-full px-1.5 py-0.5">
                      ₹{walletBalance}
                    </span>
                  )}
                </Link>
              )}

              <Link
                href="/wishlist"
                className="p-2.5 hover:bg-ivory/50 rounded-xl transition-all duration-300 relative group"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 text-text-primary group-hover:text-accent transition-colors duration-300" />
                {mounted && wishlistCount > 0 && (
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
                className="p-2.5 hover:bg-ivory/50 rounded-xl transition-all duration-300 relative group"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5 text-text-primary group-hover:text-accent transition-colors duration-300" />
                {mounted && cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-accent text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-medium"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>

              {/* Account */}
              {isLoggedIn ? (
                <div className="relative account-menu-container">
                  <button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className="flex items-center gap-2 p-2.5 hover:bg-ivory/50 rounded-xl transition-all duration-300 group"
                    aria-label="Account menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center border-2 border-accent/20">
                      <User className="w-4 h-4 text-accent" />
                    </div>
                    <span className="hidden md:block text-text-primary font-medium text-[15px]">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-text-primary hidden md:block transition-transform duration-300 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isAccountMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-56 bg-surface/95 backdrop-blur-xl rounded-2xl shadow-luxury border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="p-5 border-b border-gray-100">
                          <p className="font-semibold text-text-primary text-[15px]">{user?.name}</p>
                          <p className="text-sm text-text-muted mt-1">{user?.email}</p>
                          {mounted && walletBalance > 0 && (
                            <p className="text-sm text-gold font-medium mt-2">
                              Wallet: ₹{walletBalance.toLocaleString()}
                            </p>
                          )}
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
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 hover:bg-ivory/50 rounded-xl transition-all duration-300 group"
                >
                  <User className="w-5 h-5 text-text-primary group-hover:text-accent transition-colors duration-300" />
                  <span className="text-text-primary font-medium text-[15px]">Login</span>
                </Link>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 hover:bg-ivory/50 rounded-xl transition-all duration-300"
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
              className="lg:hidden border-t border-gray-100 bg-surface/95 backdrop-blur-xl"
            >
              <nav className="px-4 sm:px-6 lg:px-8 xl:px-20 py-6 flex flex-col gap-3">
                {navCategories.map((category) => {
                  const isActive = isCategoryActive(category.href);
                  return (
                    <Link
                      key={category.name}
                      href={category.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`transition-colors duration-300 font-medium text-[15px] py-2 ${isActive ? 'text-accent' : 'text-text-primary hover:text-accent'
                        }`}
                    >
                      {category.name}
                    </Link>
                  );
                })}
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
                      onClick={async () => {
                        await handleLogout();
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
      </header>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
      />
    </>
  );
}

export default function DroviaHeader() {
  return (
    <Suspense fallback={null}>
      <DroviaHeaderInner />
    </Suspense>
  );
}

