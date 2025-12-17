'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/types';
import { addToCart } from '@/lib/cart';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/wishlist';
import Button from './Button';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes?.[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (!product) return null;

  const sizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    await addToCart(product, selectedSize, quantity);

    // Flying animation simulation
    setTimeout(() => {
      setIsAddingToCart(false);
      // Could trigger a toast notification here
    }, 600);
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    setInWishlist(!inWishlist);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.2, 0.9, 0.12, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-surface rounded-3xl shadow-luxury-lg max-w-5xl w-full max-h-[90vh] overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Section */}
                <div className="relative aspect-square md:aspect-auto md:h-full bg-ivory">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  {discount > 0 && (
                    <div className="absolute top-6 left-6 bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold">
                      -{discount}%
                    </div>
                  )}
                  <button
                    onClick={onClose}
                    className="absolute top-6 right-6 bg-surface/95 backdrop-blur-sm p-2 rounded-full shadow-luxury hover:bg-surface transition-all duration-300"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-text-primary" />
                  </button>
                </div>

                {/* Content Section */}
                <div className="p-8 md:p-10 overflow-y-auto max-h-[90vh]">
                  <div className="mb-6">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-3">
                      {product.name}
                    </h2>
                    {product.fabric && (
                      <p className="text-sm text-text-muted uppercase tracking-wide mb-4">
                        {product.fabric}
                      </p>
                    )}
                    <div className="flex items-baseline gap-3 mb-6">
                      {product.originalPrice && (
                        <span className="text-text-muted line-through text-lg">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-accent font-bold text-3xl tracking-tight">
                        ₹{product.price.toLocaleString()}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-text-muted leading-relaxed mb-6">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Size Selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-text-primary mb-3">
                      Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-5 py-2.5 rounded-xl border-2 transition-all duration-300 font-medium ${selectedSize === size
                              ? 'border-accent bg-accent text-white'
                              : 'border-gray-200 text-text-primary hover:border-accent/50'
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-text-primary mb-3">
                      Quantity
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-accent transition-colors duration-300"
                      >
                        −
                      </button>
                      <span className="text-xl font-semibold text-text-primary w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-accent transition-colors duration-300"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="primary"
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                    </Button>
                    <button
                      onClick={handleWishlistToggle}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${inWishlist
                          ? 'border-error bg-error/5 text-error'
                          : 'border-gray-200 text-text-primary hover:border-error/50'
                        }`}
                      aria-label="Add to wishlist"
                    >
                      <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

