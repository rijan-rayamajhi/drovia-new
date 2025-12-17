/**
 * Migration Script: Import products from lib/products.ts to MongoDB
 * 
 * Usage:
 * 1. Ensure MongoDB is running
 * 2. Set MONGODB_URI in .env.local
 * 3. Run: npx ts-node scripts/migrate-products.ts
 */

import connectToDatabase from '../lib/db/mongodb';
import Product from '../models/Product';
import { allProducts } from '../lib/products';

async function migrateProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToDatabase();
    console.log('Connected to MongoDB!');

    console.log(`Migrating ${allProducts.length} products...`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const product of allProducts) {
      try {
        // Check if product already exists (by name or ID)
        const existing = await Product.findOne({
          $or: [
            { name: product.name },
            { sku: product.id }
          ]
        });

        if (existing) {
          console.log(`⏭️  Skipping existing product: ${product.name}`);
          skipCount++;
          continue;
        }

        // Create product in MongoDB
        await Product.create({
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image, // Keep existing URLs for now
          images: product.images || [],
          category: product.category,
          gender: product.gender,
          description: product.description,
          fabric: product.fabric,
          sizes: product.sizes || [],
          inStock: product.inStock !== false,
          stock: 50, // Default stock
          featured: product.featured || false,
          new: product.new || false,
          collection: product.collection,
          sku: `SKU-${product.id}`,
        });

        console.log(`✅ Migrated: ${product.name}`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Error migrating ${product.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`⏭️  Skipped (already exists): ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📦 Total products in database: ${await Product.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateProducts();

