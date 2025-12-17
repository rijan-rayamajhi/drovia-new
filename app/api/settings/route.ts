import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import Settings from '@/models/Settings';
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

async function getSettings() {
    await connectDB();
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({});
    }
    return NextResponse.json(settings);
}

async function updateSettings(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create(body);
        } else {
            Object.assign(settings, body);
            await settings.save();
        }

        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return getSettings();
}

export const POST = requireAdmin(updateSettings);
