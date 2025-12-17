'use client';

import Link from 'next/link';
import DroviaHeader from '@/components/DroviaHeader';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen">
      <DroviaHeader />
      <div className="mt-20 section-padding py-16">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Order Placed Successfully!</h1>
            <p className="text-text-light text-lg mb-8">
              Thank you for your purchase. Your order has been confirmed and will be shipped soon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop">
                <Button variant="primary">Continue Shopping</Button>
              </Link>
              <Link href="/">
                <Button variant="secondary">Back to Home</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

