'use client';

import DroviaHeader from '@/components/DroviaHeader';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function TermsPage() {
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
            Terms & Conditions
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="prose prose-lg max-w-none space-y-6 text-text-light"
          >
            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Agreement to Terms</h2>
              <p>
                By accessing and using this website, you accept and agree to be bound by the
                terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials on our
                website for personal, non-commercial transitory viewing only.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Product Information</h2>
              <p>
                We strive to provide accurate product descriptions and images. However, we do
                not warrant that product descriptions or other content is accurate, complete,
                reliable, current, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Pricing</h2>
              <p>
                All prices are subject to change without notice. We reserve the right to modify
                prices at any time.
              </p>
            </section>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

