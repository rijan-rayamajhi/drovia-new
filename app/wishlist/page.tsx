'use client';

import { useState, useEffect } from 'react';
import DroviaHeader from '@/components/DroviaHeader';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { getWishlistItems, removeFromWishlist } from '@/lib/wishlist';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(getWishlistItems());

  useEffect(() => {
    const updateWishlist = () => {
      setWishlistItems(getWishlistItems());
    };
    window.addEventListener('wishlistUpdated', updateWishlist);
    return () => window.removeEventListener('wishlistUpdated', updateWishlist);
  }, []);

  return (
    <div className="min-h-screen">
      <DroviaHeader />
      <div className="mt-20 section-padding py-16">
        <div className="container-max">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">My Wishlist</h1>

          {wishlistItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-text mb-4">Your wishlist is empty</h2>
              <p className="text-text-light mb-8">Start adding products you love!</p>
              <a href="/shop" className="btn-primary inline-block">
                Browse Products
              </a>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistItems.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

