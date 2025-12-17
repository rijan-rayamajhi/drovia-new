import connectToDatabase from './mongodb';
import User from '@/models/User';
import { User as UserType } from '@/lib/userAuth';

export async function createUser(userData: {
  email: string;
  name: string;
  password: string;
  phone?: string;
  role?: 'user' | 'admin';
}): Promise<UserType> {
  await connectToDatabase();
  
  const user = await User.create({
    email: userData.email,
    name: userData.name,
    password: userData.password,
    phone: userData.phone,
    role: userData.role || 'user'
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone
  };
}

export async function getUserByEmail(email: string) {
  await connectToDatabase();
  return await User.findOne({ email: email.toLowerCase() });
}

export async function getUserById(id: string) {
  await connectToDatabase();
  const user = await User.findById(id);
  if (!user) return null;
  
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role
  };
}

export async function updateUser(id: string, updates: Partial<UserType>) {
  await connectToDatabase();
  const user = await User.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: new Date() },
    { new: true }
  );
  
  if (!user) return null;
  
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone
  };
}

export async function deleteUser(id: string) {
  await connectToDatabase();
  return await User.findByIdAndDelete(id);
}

export async function getAllUsers() {
  await connectToDatabase();
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  
  return users.map(user => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt
  }));
}

