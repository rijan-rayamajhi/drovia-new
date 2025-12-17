/**
 * Script to create admin user
 * 
 * Usage:
 * npx ts-node scripts/create-admin-user.ts
 */

import connectToDatabase from '../lib/db/mongodb';
import User from '../models/User';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToDatabase();
    console.log('Connected!\n');

    const email = await question('Enter admin email: ');
    const name = await question('Enter admin name: ');
    const password = await question('Enter admin password: ');

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log('\n❌ User with this email already exists!');
      console.log('Updating to admin role...');
      existing.role = 'admin';
      existing.password = password; // Will be hashed by pre-save hook
      await existing.save();
      console.log('✅ User updated to admin role!');
    } else {
      // Create new admin user
      const admin = await User.create({
        email: email.toLowerCase(),
        name,
        password,
        role: 'admin',
      });
      console.log('\n✅ Admin user created successfully!');
      console.log(`   ID: ${admin._id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
    }

    rl.close();
    process.exit(0);
  } catch (error: any) {
    console.error('Error creating admin user:', error.message);
    rl.close();
    process.exit(1);
  }
}

createAdminUser();

