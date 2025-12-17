'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DroviaHeader from '@/components/DroviaHeader';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import { getAdminProducts } from '@/lib/adminProducts';
import { Product } from '@/types';

const categories = ['All', 'T-Shirts', 'Jackets', 'Shirts', 'Pants', 'Sweaters', 'Footwear', 'Hoodies'];
const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

function ShopPageInner() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 10000]);

  // Load products from admin storage
  useEffect(() => {
    const loadProducts = async () => {
      const loadedProducts = await getAdminProducts();
      setProducts(loadedProducts);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const category = searchParams.get('category');
    const gender = searchParams.get('gender');
    if (category) {
      setSelectedCategory(category);
    }
    if (gender) {
      setSelectedGender(gender);
    }
  }, [searchParams]);

  const filteredProducts = products
    .filter((product) => {
      // Gender filter: include unisex products for men/women filters
      if (selectedGender) {
        const productGender = product.gender || 'unisex';
        if (productGender !== 'unisex' && productGender !== selectedGender) {
          return false;
        }
      }
      // Category filter
      if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;
      // Price filter
      if (priceRange[0] > product.price || priceRange[1] < product.price) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen">
      <DroviaHeader />
      <div className="mt-20 section-padding py-8">
        <div className="container-max">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Shop</h1>

          {/* Filters & Sort - Mobile */}
          <div className="md:hidden mb-6 space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${selectedCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text hover:bg-gray-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full input-field"
            >
              <option value="newest">New Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div>
                  <h3 className="font-semibold text-text mb-3">Gender</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedGender(null)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${selectedGender === null
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedGender('men')}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${selectedGender === 'men'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                      Men
                    </button>
                    <button
                      onClick={() => setSelectedGender('women')}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${selectedGender === 'women'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                      Women
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-text mb-3">Category</h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedCategory === cat
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-text mb-3">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${selectedSize === size
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 hover:border-primary'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-text mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-text-light">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <p className="text-text-light">
                  Showing {filteredProducts.length} products
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="hidden md:block input-field w-48"
                >
                  <option value="newest">New Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
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
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopPageInner />
    </Suspense>
  );
}

