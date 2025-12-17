'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'product-card' | 'text' | 'image' | 'button';
  count?: number;
}

export default function SkeletonLoader({ 
  className = '', 
  variant = 'text',
  count = 1 
}: SkeletonLoaderProps) {
  const baseClasses = 'bg-gray-200 animate-pulse rounded';
  
  const variantClasses = {
    'product-card': 'aspect-[2/3] w-full',
    'text': 'h-4 w-full',
    'image': 'aspect-square w-full',
    'button': 'h-12 w-32',
  };

  if (variant === 'product-card') {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.06 }}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
          >
            <div className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
          </motion.div>
        ))}
      </>
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        />
      ))}
    </>
  );
}

