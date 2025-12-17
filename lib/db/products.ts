import connectToDatabase from './mongodb';
import Product from '@/models/Product';
import { Product as ProductType } from '@/types';

export async function getProducts(filters?: {
  category?: string;
  gender?: string;
  collection?: string;
  featured?: boolean;
  new?: boolean;
  inStock?: boolean;
}): Promise<ProductType[]> {
  await connectToDatabase();
  
  const query: any = {};
  if (filters?.category) query.category = filters.category;
  if (filters?.gender) query.gender = filters.gender;
  if (filters?.collection) query.collection = filters.collection;
  if (filters?.featured !== undefined) query.featured = filters.featured;
  if (filters?.new !== undefined) query.new = filters.new;
  if (filters?.inStock !== undefined) query.inStock = filters.inStock;

  const products = await Product.find(query).sort({ createdAt: -1 });
  
  return products.map(product => ({
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

export async function getProductById(id: string): Promise<ProductType | null> {
  await connectToDatabase();
  const product = await Product.findById(id);
  
  if (!product) return null;
  
  return {
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
  };
}

export async function createProduct(productData: Omit<ProductType, 'id'>): Promise<ProductType> {
  await connectToDatabase();
  
  const product = await Product.create({
    ...productData,
    sku: productData.name.replace(/\s+/g, '-').toUpperCase() + '-' + Date.now()
  });
  
  return {
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
  };
}

export async function updateProduct(id: string, updates: Partial<ProductType>): Promise<ProductType | null> {
  await connectToDatabase();
  const product = await Product.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: new Date() },
    { new: true }
  );
  
  if (!product) return null;
  
  return {
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
  };
}

export async function deleteProduct(id: string): Promise<boolean> {
  await connectToDatabase();
  const result = await Product.findByIdAndDelete(id);
  return !!result;
}

export async function searchProducts(searchTerm: string): Promise<ProductType[]> {
  await connectToDatabase();
  const products = await Product.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { category: { $regex: searchTerm, $options: 'i' } }
    ]
  }).limit(20);
  
  return products.map(product => ({
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

