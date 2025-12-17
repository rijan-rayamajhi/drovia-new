'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import DroviaHeader from '@/components/DroviaHeader';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/Button';
import { ShoppingCart, Minus, Plus, Check, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAdminProducts } from '@/lib/adminProducts';
import { Product } from '@/types';
import { addToCart } from '@/lib/cart';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/wishlist';

// Mock product data (fallback)
const fallbackProduct = {
  id: '1',
  name: 'Premium Cotton T-Shirt',
  price: 1299,
  originalPrice: 1999,
  image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
  images: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
  ],
  category: 'T-Shirts',
  description: 'Premium quality cotton t-shirt with modern fit. Perfect for everyday wear.',
  fabric: '100% Premium Cotton',
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  inStock: true,
};


export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<any>(fallbackProduct);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  // Load products from admin storage
  useEffect(() => {
    const loadData = async () => {
      const loadedProducts = await getAdminProducts();
      setProducts(loadedProducts);
      const foundProduct = loadedProducts.find((p) => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
      }
    };
    loadData();
  }, [productId]);

  useEffect(() => {
    setInWishlist(isInWishlist(product.id));
  }, [product.id]);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    await addToCart(product, selectedSize, quantity);
    alert('Added to cart!');
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
    <div className="min-h-screen">
      <DroviaHeader />
      <div className="mt-20 section-padding py-8">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-16">
            {/* Image Gallery */}
            <div>
              <div className="relative aspect-square mb-4 rounded-xl overflow-hidden">
                <Image
                  src={product.images?.[selectedImage] || product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {(product.images || [product.image]).map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-primary' : 'border-transparent'
                      }`}
                  >
                    <Image src={img} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
                <button
                  onClick={handleWishlistToggle}
                  className="p-3 rounded-full border-2 border-gray-300 hover:border-red-500 transition-colors"
                >
                  <Heart className={`w-6 h-6 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-text'}`} />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                {product.originalPrice && (
                  <span className="text-text-muted line-through text-xl">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-primary font-bold text-3xl">
                  ₹{product.price.toLocaleString()}
                </span>
                {discount > 0 && (
                  <span className="bg-primary text-white px-3 py-1 rounded-lg text-sm font-semibold">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {((product as any).longDescription || (product as any).shortDescription || product.description) && (
                <p className="text-text-light mb-6">
                  {(product as any).longDescription || (product as any).shortDescription || product.description}
                </p>
              )}

              {product.fabric && (
                <div className="mb-6">
                  <h3 className="font-semibold text-text mb-2">Fabric</h3>
                  <p className="text-text-light">{product.fabric}</p>
                </div>
              )}

              {/* Size Selector */}
              <div className="mb-6">
                <h3 className="font-semibold text-text mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {(product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${selectedSize === size
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 hover:border-primary'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector & Add to Cart */}
              <div className="mb-6">
                <h3 className="font-semibold text-text mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border-2 border-gray-300 rounded-lg hover:border-primary transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 border-2 border-gray-300 rounded-lg hover:border-primary transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    variant="primary"
                    className="flex-1 py-4 text-lg flex items-center justify-center gap-2"
                    onClick={handleAddToCart}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="w-5 h-5" />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products
                .filter((p) => p.category === product.category && p.id !== product.id)
                .slice(0, 4)
                .map((p, index) => (
                  <ProductCard key={p.id} product={p} index={index} />
                ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

