'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/wishlist';
import { getProductImageUrl } from '@/lib/imageCache';
import QuickViewModal from './QuickViewModal';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [inWishlist, setInWishlist] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const isNew = product.featured || false;
  const isLimited = mounted && (product.id.charCodeAt(0) % 3 === 0);

  const [imageUrl, setImageUrl] = useState(getProductImageUrl(product));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setInWishlist(isInWishlist(product.id));
    const handleWishlistUpdate = () => setInWishlist(isInWishlist(product.id));
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    const handleProductUpdate = (e: CustomEvent) => {
      if (e.detail?.productId === product.id) {
        setImageUrl(getProductImageUrl(product));
      }
    };
    window.addEventListener('productUpdated', handleProductUpdate as EventListener);

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('productUpdated', handleProductUpdate as EventListener);
    };
  }, [product, mounted]);

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="product-card group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-luxury transition-shadow duration-300"
      >
        <div className="relative overflow-hidden aspect-[2/3] bg-ivory">
          <Link href={`/product/${product.id}`}>
            <Image
              src={imageUrl || product.image}
              alt={product.name}
              fill
              className="object-cover"
              loading="lazy"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {discount > 0 && (
              <span className="bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide shadow-medium">
                -{discount}%
              </span>
            )}
            {isNew && (
              <span className="bg-gold text-white px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide shadow-medium">
                New
              </span>
            )}
            {mounted && isLimited && (
              <span className="bg-error text-white px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide shadow-medium">
                Limited
              </span>
            )}
          </div>

          {/* Wishlist Button - Top Right */}
          <button
            className="absolute top-4 right-4 bg-white p-2.5 rounded-full shadow-medium hover:shadow-luxury transition-all duration-300 z-20"
            onClick={handleWishlistToggle}
            aria-label="Add to wishlist"
          >
            <Heart className={`w-5 h-5 transition-colors duration-300 ${inWishlist ? 'fill-error text-error' : 'text-text-primary'
              }`} />
          </button>

        </div>

        <div className="p-5">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-medium text-text-primary mb-2 line-clamp-2 text-[15px] leading-snug">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2.5">
              {product.originalPrice && (
                <span className="text-text-muted line-through text-sm">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-primary font-bold text-xl tracking-tight">
                ₹{product.price.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleOpenQuickView}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors duration-300 shadow-medium hover:shadow-luxury flex-shrink-0"
              aria-label="Select options"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
      </motion.div>

      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
