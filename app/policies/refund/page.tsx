'use client';

import DroviaHeader from '@/components/DroviaHeader';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function RefundPolicyPage() {
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
            Refund & Return Policy
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="prose prose-lg max-w-none space-y-6 text-text-light"
          >
            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Returns</h2>
              <p>
                We accept returns within 7 days of delivery. Items must be unworn, unwashed, and
                in their original packaging with tags attached.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Refunds</h2>
              <p>
                Once we receive your returned item, we will inspect it and notify you of the
                approval or rejection of your refund. If approved, the refund will be processed
                to your original payment method within 5-7 business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Exchanges</h2>
              <p>
                We currently do not offer direct exchanges. To exchange an item, please return
                the original item and place a new order for the desired item.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Shipping</h2>
              <p>
                Return shipping costs are the responsibility of the customer unless the item
                received was defective or incorrect.
              </p>
            </section>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

