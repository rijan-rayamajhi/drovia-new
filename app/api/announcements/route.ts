import { NextRequest, NextResponse } from 'next/server';
import { getAnnouncements, getAllAnnouncementsAdmin, createAnnouncement, deleteAnnouncement, toggleAnnouncement } from '@/lib/db/announcements';
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Check if admin request based on query param or header (simplified for now, just return all for admin page)
        const url = new URL(req.url);
        const isAdmin = url.searchParams.get('admin') === 'true';

        if (isAdmin) {
            const data = await getAllAnnouncementsAdmin();
            return NextResponse.json(data);
        } else {
            const data = await getAnnouncements();
            return NextResponse.json(data);
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

async function createHandler(req: NextRequest) {
    try {
        const body = await req.json();
        if (!body.text) return NextResponse.json({ error: 'Text required' }, { status: 400 });

        const newAnnouncement = await createAnnouncement(body.text);
        return NextResponse.json(newAnnouncement);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function deleteHandler(req: NextRequest) {
    try {
        const body = await req.json();
        await deleteAnnouncement(body.id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function toggleHandler(req: NextRequest) {
    try {
        const body = await req.json();
        await toggleAnnouncement(body.id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const POST = requireAdmin(createHandler);
export const DELETE = requireAdmin(deleteHandler);
export const PATCH = requireAdmin(toggleHandler);
