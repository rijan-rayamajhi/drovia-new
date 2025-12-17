'use client';

import { useState, useEffect } from 'react';
import DroviaHeader from '@/components/DroviaHeader';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import { getAdminProducts } from '@/lib/adminProducts';
import { Product } from '@/types';

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = await getAdminProducts();
      // Filter products marked as featured/new and sort by newest
      const newProducts = allProducts
        .filter((product) => product.featured || product.new)
        .sort((a, b) => {
          // Sort by featured first, then by ID (newest)
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.id.localeCompare(a.id);
        });
      setProducts(newProducts);
    };
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen">
      <DroviaHeader />
      <div className="mt-20 section-padding py-8">
        <div className="container-max">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 text-text-primary"
          >
            New Arrivals
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-text-muted text-lg mb-12"
          >
            Discover the latest additions to our collection
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.52,
                  delay: index * 0.06,
                  ease: [0.2, 0.9, 0.12, 1],
                }}
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-text-muted text-lg">No new arrivals found.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

