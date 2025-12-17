'use client';

import DroviaHeader from '@/components/DroviaHeader';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <DroviaHeader />
      <div className="mt-20 section-padding py-16">
        <div className="container-max max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-8"
          >
            Privacy Policy
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="prose prose-lg max-w-none space-y-6 text-text-light"
          >
            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Information We Collect</h2>
              <p>
                We collect information that you provide directly to us, including when you
                create an account, make a purchase, or contact us for support.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">How We Use Your Information</h2>
              <p>
                We use the information we collect to process your orders, communicate with you,
                and improve our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We
                may share your information only as described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

