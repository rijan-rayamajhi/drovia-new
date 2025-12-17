import { Product } from '@/types';

// Fetch all products from API
export const getAdminProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch('/api/products', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Save products (not used anymore, kept for compatibility)
export const saveAdminProducts = (products: Product[]): void => {
  console.warn('saveAdminProducts is deprecated. Use API endpoints instead.');
};

// Add new product via API
export const addAdminProduct = async (product: any): Promise<boolean> => {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create product');
    }

    return true;
  } catch (error: any) {
    console.error('Error adding product:', error);
    alert(error.message || 'Failed to add product');
    return false;
  }
};

// Update product via API
export const updateAdminProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
  try {
    const response = await fetch('/api/products', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update product');
    }

    return true;
  } catch (error: any) {
    console.error('Error updating product:', error);
    alert(error.message || 'Failed to update product');
    return false;
  }
};

// Delete product via API
export const deleteAdminProduct = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/products?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete product');
    }

    return true;
  } catch (error: any) {
    console.error('Error deleting product:', error);
    alert(error.message || 'Failed to delete product');
    return false;
  }
};
