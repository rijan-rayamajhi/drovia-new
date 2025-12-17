import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth-middleware';

// DELETE: Remove all products
async function clearProductsHandler() {
    try {
        await connectToDatabase();
        await Product.deleteMany({});
        return NextResponse.json({ success: true, message: 'All products deleted' });
    } catch (error: any) {
        console.error('Clear products error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const DELETE = clearProductsHandler;
