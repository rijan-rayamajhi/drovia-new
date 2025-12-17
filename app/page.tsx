'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import DroviaHeader from '@/components/DroviaHeader';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import NewsletterSection from '@/components/NewsletterSection';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import Button from '@/components/Button';
import { getAdminProducts } from '@/lib/adminProducts';
import { Product } from '@/types';

const categories = [
  { name: 'Male', image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400', gender: 'men' },
  { name: 'Female', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400', gender: 'women' },
  { name: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
  { name: 'Jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' },
  { name: 'Shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400' },
  { name: 'Pants', image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400' },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const products = await getAdminProducts();
      // Show featured products first, or newest products if none are marked as featured
      const featured = products.filter(p => p.featured).slice(0, 6);
      const displayProducts = featured.length > 0
        ? featured
        : products.slice(0, 6); // Show first 6 products if no featured products
      setFeaturedProducts(displayProducts);
    };
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen">
      <DroviaHeader />

      {/* Auto-scrolling Banner */}
      <div className="mt-24 md:mt-32">
        <AnnouncementBanner />
      </div>

      {/* Hero Section with Parallax */}
      <section
        ref={heroRef}
        className="relative h-[85vh] md:h-[95vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-ivory"
      >
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920)',
            y,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ opacity }}
          transition={{ duration: 0.8, ease: [0.2, 0.9, 0.12, 1] }}
          className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-7xl lg:text-8xl font-display font-bold mb-6 leading-tight tracking-tight"
          >
            DROVIA
            <br />
            <span className="text-gold">Premium Fashion</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl mb-12 text-gray-100 font-light leading-relaxed"
          >
            Discover our latest collection of high-quality clothing
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link href="/shop">
              <Button variant="primary" className="text-lg px-10 py-5 border-2 border-gold/30">
                Shop Now
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-surface">
        <div className="container-max">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-center mb-16 text-text-primary"
          >
            Shop by Category
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                href={category.gender ? `/shop?gender=${category.gender}` : `/shop?category=${encodeURIComponent(category.name)}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer shadow-luxury"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-all duration-500" />
                  <div className="absolute inset-0 flex items-end justify-center pb-6 md:pb-8">
                    <h3 className="text-white text-xl md:text-2xl font-display font-semibold tracking-wide">
                      {category.name}
                    </h3>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-ivory">
        <div className="container-max">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-center mb-16 text-text-primary"
          >
            Featured Products
          </motion.h2>
          {featuredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-muted text-lg">No products available yet. Add products from the admin panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection />

      <Footer />
    </div>
  );
}

