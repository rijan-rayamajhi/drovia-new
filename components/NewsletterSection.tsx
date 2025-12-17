'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import { addSubscriber } from '@/lib/subscribers';
import { Check, X } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    setStatus('loading');
    setMessage('');

    const result = await addSubscriber(email.trim());

    if (result.success) {
      setStatus('success');
      setMessage(result.message);
      setEmail('');
      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } else {
      setStatus('error');
      setMessage(result.message);
    }
  };

  return (
    <section className="section-padding py-16">
      <div className="container-max bg-primary rounded-2xl p-8 md:p-16 text-center text-white">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          Stay Updated
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl mb-8"
        >
          Subscribe to our newsletter for the latest collections and offers.
        </motion.p>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto"
        >
          <div className="flex-1 w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') {
                  setStatus('idle');
                  setMessage('');
                }
              }}
              placeholder="Enter your email"
              required
              disabled={status === 'loading'}
              className={`w-full px-6 py-3 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-white ${
                status === 'error' ? 'ring-2 ring-red-300' : ''
              } disabled:opacity-50`}
            />
          </div>
          <Button 
            variant="secondary" 
            type="submit"
            disabled={status === 'loading'}
            className="bg-white text-primary px-8 py-3 disabled:opacity-50"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </motion.form>
        
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 flex items-center justify-center gap-2 ${
              status === 'success' ? 'text-green-100' : 'text-red-100'
            }`}
          >
            {status === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{message}</span>
          </motion.div>
        )}
      </div>
    </section>
  );
}

