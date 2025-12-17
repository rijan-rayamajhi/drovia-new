'use client';

/**
 * Adds cache-busting version parameter to image URLs
 */
export const getImageUrl = (imageUrl: string, version?: number): string => {
  if (!imageUrl) return '';
  
  // If it's a data URL, return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // If version is provided, add it as query parameter
  if (version) {
    try {
      const url = new URL(imageUrl, window.location.origin);
      url.searchParams.set('v', version.toString());
      return url.toString();
    } catch {
      // If URL parsing fails, append version
      return `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}v=${version}`;
    }
  }

  return imageUrl;
};

/**
 * Gets image URL with cache-busting from product data
 */
export const getProductImageUrl = (product: any, index: number = 0): string => {
  const imageUrl = product.images?.[index] || product.image || '';
  const version = product.imageVersion || product.updatedAt || Date.now();
  return getImageUrl(imageUrl, version);
};

