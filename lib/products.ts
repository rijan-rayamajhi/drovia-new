import { Product } from '@/types';

// Empty array - all products are now managed through admin panel
export const allProducts: Product[] = [];

// These functions are kept for backward compatibility but return empty arrays
// Use getAdminProducts() from '@/lib/adminProducts' instead
export const getProductById = (id: string): Product | undefined => {
  return allProducts.find((p) => p.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'All') return allProducts;
  return allProducts.filter((p) => p.category === category);
};

