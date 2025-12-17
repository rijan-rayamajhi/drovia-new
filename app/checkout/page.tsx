'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DroviaHeader from '@/components/DroviaHeader';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Check } from 'lucide-react';
import { isUserAuthenticated, getUser } from '@/lib/userAuth';
import { getCartItems, clearCart } from '@/lib/cart';
import { saveOrder, convertItemsToOrderItems } from '@/lib/orders';
import { getWalletBalance, debitWallet } from '@/lib/wallet';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    alternatePhone: '',
    houseFlat: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'ONLINE' as 'ONLINE' | 'COD' | 'WALLET',
  });
  const [walletBalance, setWalletBalance] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingSettings, setShippingSettings] = useState({
    shippingEnabled: true,
    shippingCharge: 99,
    freeShippingThreshold: 2000,
  });

  useEffect(() => {
    setMounted(true);
    if (!isUserAuthenticated()) {
      router.push(`/login?redirect=${encodeURIComponent('/checkout')}`);
    } else {
      // Pre-fill form with user data
      const user = getUser();
      if (user) {
        setFormData((prev) => ({
          ...prev,
          name: user.name || '',
          phone: user.phone || '',
        }));

        // Load wallet balance from API
        fetch('/api/wallet')
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error('Failed to fetch wallet');
          })
          .then((data) => {
            setWalletBalance(data.balance || 0);
          })
          .catch((err) => {
            console.error('Failed to load wallet balance', err);
            // Fallback to local storage if API fails
            const userId = user.email || user.name;
            if (userId) {
              const balance = getWalletBalance(userId);
              setWalletBalance(balance);
            }
          });
      }
    }

    // Fetch settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) setShippingSettings(data);
      })
      .catch((err) => console.error('Failed to load settings', err));

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Listen for wallet updates
    const handleWalletUpdate = () => {
      // Re-fetch from API on update
      fetch('/api/wallet')
        .then((res) => res.json())
        .then((data) => {
          setWalletBalance(data.balance || 0);
        })
        .catch((err) => console.error('Failed to update wallet balance', err));
    };
    window.addEventListener('walletUpdated', handleWalletUpdate);
    return () => {
      window.removeEventListener('walletUpdated', handleWalletUpdate);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [router]);

  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchCart = async () => {
      const items = await getCartItems();
      setCartItems(items);
    };
    fetchCart();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = !shippingSettings.shippingEnabled
    ? 0
    : subtotal > shippingSettings.freeShippingThreshold
      ? 0
      : shippingSettings.shippingCharge;
  const total = subtotal + shipping;

  // Calculate wallet discount if using wallet
  const walletDiscount = formData.paymentMethod === 'WALLET' && walletBalance > 0
    ? Math.min(walletBalance, total)
    : 0;
  const finalTotal = total - walletDiscount;

  if (!mounted || !isUserAuthenticated()) {
    return null;
  }

  const handleOnlinePayment = async (orderId: string, user: any) => {
    setIsProcessing(true);
    try {
      // Create Razorpay order
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Make sure to expose this in next.config.js or use environment variable
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Drovia',
        description: 'Order Payment',
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            // Save order after successful payment
            const order = {
              id: orderId,
              customerName: formData.name,
              phone: formData.phone,
              address: `${formData.houseFlat}, ${formData.street}${formData.landmark ? ', ' + formData.landmark : ''}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
              items: cartItems,
              orderItems: convertItemsToOrderItems(cartItems, orderId),
              total: total,
              status: 'Pending' as const,
              createdAt: new Date().toISOString().split('T')[0],
              orderDate: new Date().toISOString(),
              paymentMethod: 'ONLINE' as const,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              userId: user?.email || user?.name,
            };

            // Save order via API
            const saveResponse = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(order),
            });

            if (!saveResponse.ok) {
              throw new Error('Failed to save order');
            }

            await clearCart();
            router.push('/checkout/success');
          } catch (error: any) {
            console.error('Payment verification error:', error);
            alert(`Payment verification failed: ${error.message}`);
          }
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
          email: user.email,
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        alert(response.error.description);
      });
      rzp1.open();
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('Failed to initialize payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.houseFlat) newErrors.houseFlat = 'House/Flat number is required';
    if (!formData.street) newErrors.street = 'Street name is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const user = getUser();
    const orderId = `ORD-${Date.now()}`;

    if (formData.paymentMethod === 'ONLINE') {
      await handleOnlinePayment(orderId, user);
    } else if (formData.paymentMethod === 'WALLET') {
      // Check wallet balance
      if (!user) {
        setErrors({ ...errors, paymentMethod: 'Please login to use wallet' });
        return;
      }

      // Use the state balance which comes from API
      if (walletBalance < total) {
        setErrors({ ...errors, paymentMethod: `Insufficient wallet balance. Available: ₹${walletBalance.toLocaleString()}` });
        return;
      }

      // Debit wallet via API
      try {
        const response = await fetch('/api/wallet', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            description: `Payment for Order #${orderId}`,
            orderId: orderId
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setErrors({ ...errors, paymentMethod: data.error || 'Failed to process wallet payment' });
          return;
        }

        // Dispatch wallet updated event
        const userId = user.email || user.name;
        window.dispatchEvent(new CustomEvent('walletUpdated', { detail: { userId } }));
      } catch (error) {
        console.error('Wallet payment error:', error);
        setErrors({ ...errors, paymentMethod: 'Failed to process wallet payment' });
        return;
      }

      // Save order for wallet payment
      const order = {
        id: orderId,
        customerName: formData.name,
        phone: formData.phone,
        address: `${formData.houseFlat}, ${formData.street}${formData.landmark ? ', ' + formData.landmark : ''}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        items: cartItems,
        orderItems: convertItemsToOrderItems(cartItems, orderId),
        total: total,
        status: 'Pending' as const,
        createdAt: new Date().toISOString().split('T')[0],
        orderDate: new Date().toISOString(),
        paymentMethod: formData.paymentMethod as any,
        userId: user?.email || user?.name,
      };

      // Save order via API
      try {
        const saveResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order),
        });

        if (!saveResponse.ok) {
          throw new Error('Failed to save order');
        }

        clearCart();
        router.push('/checkout/success');
      } catch (error: any) {
        console.error('Order saving error:', error);
        alert(`Failed to place order: ${error.message}`);
      }
    } else {
      // COD
      const order = {
        id: orderId,
        customerName: formData.name,
        phone: formData.phone,
        address: `${formData.houseFlat}, ${formData.street}${formData.landmark ? ', ' + formData.landmark : ''}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        items: cartItems,
        orderItems: convertItemsToOrderItems(cartItems, orderId),
        total: total,
        status: 'Pending' as const,
        createdAt: new Date().toISOString().split('T')[0],
        orderDate: new Date().toISOString(),
        paymentMethod: formData.paymentMethod as any,
        userId: user?.email || user?.name,
      };

      // Save order via API
      try {
        const saveResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order),
        });

        if (!saveResponse.ok) {
          throw new Error('Failed to save order');
        }

        clearCart();
        router.push('/checkout/success');
      } catch (error: any) {
        console.error('Order saving error:', error);
        alert(`Failed to place order: ${error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen">
      <DroviaHeader />
      <div className="mt-20 section-padding py-8">
        <div className="container-max">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Checkout</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-soft">
                <h2 className="text-2xl font-bold mb-6">Customer Information</h2>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      error={errors.phone}
                      required
                    />
                    <Input
                      label="Alternate Phone (Optional)"
                      type="tel"
                      value={formData.alternatePhone}
                      onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-text mt-6 mb-4">Shipping Address</h3>
                  <Input
                    label="House/Flat Number"
                    value={formData.houseFlat}
                    onChange={(e) => setFormData({ ...formData, houseFlat: e.target.value })}
                    error={errors.houseFlat}
                    required
                  />
                  <Input
                    label="Street Name"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    error={errors.street}
                    required
                  />
                  <Input
                    label="Landmark (Optional)"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      error={errors.city}
                      required
                    />
                    <Input
                      label="State"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      error={errors.state}
                      required
                    />
                  </div>
                  <Input
                    label="Pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    error={errors.pincode}
                    required
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 md:p-8 shadow-soft">
                <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'ONLINE' })}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${formData.paymentMethod === 'ONLINE'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 hover:border-primary'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Online Payment</h3>
                        <p className="text-text-light text-sm">UPI, Cards, Netbanking</p>
                      </div>
                      {formData.paymentMethod === 'ONLINE' && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${formData.paymentMethod === 'COD'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 hover:border-primary'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Cash on Delivery</h3>
                        <p className="text-text-light text-sm">Pay when delivered</p>
                      </div>
                      {formData.paymentMethod === 'COD' && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                  {walletBalance > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: 'WALLET' })}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${formData.paymentMethod === 'WALLET'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-primary'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            Pay with Wallet/Points
                          </h3>
                          <p className="text-text-light text-sm">
                            Balance: ₹{walletBalance.toLocaleString()}
                          </p>
                        </div>
                        {formData.paymentMethod === 'WALLET' && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  )}
                </div>
                {errors.paymentMethod && (
                  <p className="text-red-600 text-sm mt-2">{errors.paymentMethod}</p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-soft sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="font-semibold text-text-primary">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Shipping</span>
                    <span className="font-semibold text-text-primary">
                      {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  {walletDiscount > 0 && (
                    <div className="flex justify-between text-gold">
                      <span>Wallet Discount</span>
                      <span className="font-semibold">-₹{walletDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <span className="text-xl font-bold text-text-primary">Total</span>
                    <span className="text-xl font-bold text-accent">
                      ₹{finalTotal.toLocaleString()}
                    </span>
                  </div>
                  {formData.paymentMethod === 'WALLET' && walletBalance > 0 && (
                    <div className="text-sm text-text-muted pt-2 border-t border-gray-100">
                      <p>Wallet Balance: ₹{walletBalance.toLocaleString()}</p>
                      {walletBalance < total && (
                        <p className="text-warning mt-1">
                          Remaining: ₹{(total - walletBalance).toLocaleString()} to be paid
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-4 text-lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

