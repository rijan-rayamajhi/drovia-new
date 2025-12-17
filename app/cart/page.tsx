'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DroviaHeader from '@/components/DroviaHeader';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { Trash2, Minus, Plus } from 'lucide-react';
import { CartItem } from '@/types';
import { getCartItems, updateCartItemQuantity, removeFromCart } from '@/lib/cart';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingSettings, setShippingSettings] = useState({
    shippingEnabled: true,
    shippingCharge: 99,
    freeShippingThreshold: 2000,
  });

  useEffect(() => {
    const fetchCart = async () => {
      const items = await getCartItems();
      setCartItems(items);
    };

    fetchCart();

    const updateCart = async () => {
      const items = await getCartItems();
      setCartItems(items);
    };
    window.addEventListener('cartUpdated', updateCart);

    // Fetch settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) setShippingSettings(data);
      })
      .catch((err) => console.error('Failed to load settings', err));

    return () => window.removeEventListener('cartUpdated', updateCart);
  }, []);

  const updateQuantity = async (id: string, size: string, delta: number) => {
    const item = cartItems.find((item) => item.product.id === id && item.size === size);
    if (item) {
      await updateCartItemQuantity(id, size, Math.max(1, item.quantity + delta));
    }
  };

  const removeItem = async (id: string, size: string) => {
    await removeFromCart(id, size);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = !shippingSettings.shippingEnabled
    ? 0
    : subtotal > shippingSettings.freeShippingThreshold
      ? 0
      : shippingSettings.shippingCharge;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen">
      <DroviaHeader />
      <div className="mt-20 section-padding py-8">
        <div className="container-max">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-light text-xl mb-6">Your cart is empty</p>
              <Link href="/shop">
                <Button variant="primary">Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="bg-white rounded-xl p-4 md:p-6 shadow-soft flex flex-col sm:flex-row gap-4"
                  >
                    <div className="relative w-full sm:w-32 h-48 sm:h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{item.product.name}</h3>
                      <p className="text-text-light mb-2">Size: {item.size}</p>
                      <div className="flex items-center gap-2 mb-4">
                        {item.product.originalPrice && (
                          <span className="text-text-muted line-through">
                            ₹{item.product.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-primary font-bold text-lg">
                          ₹{item.product.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, -1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id, item.size)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-soft sticky top-24">
                  <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-text-light">Subtotal</span>
                      <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">Shipping</span>
                      <span className="font-semibold">
                        {shipping === 0 ? 'Free' : `₹${shipping}`}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between">
                      <span className="text-xl font-bold">Total</span>
                      <span className="text-xl font-bold text-primary">
                        ₹{total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Link href="/checkout" className="block">
                    <Button variant="primary" className="w-full py-4 text-lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

