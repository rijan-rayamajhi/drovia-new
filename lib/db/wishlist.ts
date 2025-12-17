import connectToDatabase from './mongodb';
import Wishlist from '@/models/Wishlist';
import { Product } from '@/types';

export async function getWishlist(userId: string): Promise<Product[]> {
  await connectToDatabase();
  const wishlist = await Wishlist.findOne({ userId }).populate('productIds');
  
  if (!wishlist) return [];
  
  return wishlist.productIds.map((product: any) => ({
    id: product._id.toString(),
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.image,
    images: product.images,
    category: product.category,
    gender: product.gender,
    description: product.description,
    fabric: product.fabric,
    sizes: product.sizes,
    inStock: product.inStock,
    featured: product.featured,
    new: product.new,
    collection: product.collection
  }));
}

export async function addToWishlist(userId: string, productId: string): Promise<Product[]> {
  await connectToDatabase();
  
  let wishlist = await Wishlist.findOne({ userId });
  
  if (!wishlist) {
    wishlist = await Wishlist.create({
      userId,
      productIds: []
    });
  }
  
  if (!wishlist.productIds.includes(productId as any)) {
    wishlist.productIds.push(productId as any);
    await wishlist.save();
  }
  
  return getWishlist(userId);
}

export async function removeFromWishlist(userId: string, productId: string): Promise<Product[]> {
  await connectToDatabase();
  
  const wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) return [];
  
  wishlist.productIds = wishlist.productIds.filter(
    (id: any) => id.toString() !== productId
  );
  
  await wishlist.save();
  
  return getWishlist(userId);
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  await connectToDatabase();
  const wishlist = await Wishlist.findOne({ userId });
  
  if (!wishlist) return false;
  
  return wishlist.productIds.some((id: any) => id.toString() === productId);
}

