'use client';

import { Product } from '@/types';
import { apiRequest } from './api-client';
import { allProducts } from './products';

/**
 * Get all products from API with fallback to local products
 */
export async function getProducts(filters?: {
  category?: string;
  gender?: string;
  collection?: string;
  featured?: boolean;
  new?: boolean;
  inStock?: boolean;
}): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.gender) params.append('gender', filters.gender);
    if (filters?.collection) params.append('collection', filters.collection);
    if (filters?.featured !== undefined) params.append('featured', String(filters.featured));
    if (filters?.new !== undefined) params.append('new', String(filters.new));
    if (filters?.inStock !== undefined) params.append('inStock', String(filters.inStock));

    const queryString = params.toString();
    const products = await apiRequest<Product[]>(`/api/products${queryString ? `?${queryString}` : ''}`);
    return products;
  } catch (error) {
    console.error('Failed to fetch products from API, using local products:', error);
    // Fallback to local products with filtering
    let filtered = [...allProducts];
    
    if (filters?.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters?.gender) {
      filtered = filtered.filter(p => p.gender === filters.gender);
    }
    if (filters?.collection) {
      filtered = filtered.filter(p => p.collection === filters.collection);
    }
    if (filters?.featured !== undefined) {
      filtered = filtered.filter(p => p.featured === filters.featured);
    }
    if (filters?.new !== undefined) {
      filtered = filtered.filter(p => p.new === filters.new);
    }
    if (filters?.inStock !== undefined) {
      filtered = filtered.filter(p => p.inStock === filters.inStock);
    }
    
    return filtered;
  }
}

/**
 * Get single product by ID
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const product = await apiRequest<Product>(`/api/products/${id}`);
    return product;
  } catch (error) {
    console.error('Failed to fetch product from API, using local products:', error);
    // Fallback to local products
    return allProducts.find(p => p.id === id);
  }
}

/**
 * Search products
 */
export async function searchProducts(searchTerm: string): Promise<Product[]> {
  try {
    const products = await apiRequest<Product[]>(`/api/products?search=${encodeURIComponent(searchTerm)}`);
    return products;
  } catch (error) {
    console.error('Failed to search products from API, using local products:', error);
    // Fallback to local search
    const term = searchTerm.toLowerCase();
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term)
    );
  }
}

// Export allProducts for backward compatibility
export { allProducts };

