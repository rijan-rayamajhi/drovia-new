import connectToDatabase from './mongodb';
import Announcement from '@/models/Announcement';

export async function getAnnouncements() {
    await connectToDatabase();
    // Return all active announcements, sorted by newest first
    const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 });
    return announcements.map(a => ({
        id: a._id.toString(),
        text: a.text,
        isActive: a.isActive,
        createdAt: a.createdAt
    }));
}

export async function getAllAnnouncementsAdmin() {
    await connectToDatabase();
    // Return all announcements for admin
    const announcements = await Announcement.find({}).sort({ createdAt: -1 });
    return announcements.map(a => ({
        id: a._id.toString(),
        text: a.text,
        isActive: a.isActive,
        createdAt: a.createdAt
    }));
}

export async function createAnnouncement(text: string) {
    await connectToDatabase();
    const announcement = await Announcement.create({ text });
    return {
        id: announcement._id.toString(),
        text: announcement.text,
        isActive: announcement.isActive,
        createdAt: announcement.createdAt
    };
}

export async function deleteAnnouncement(id: string) {
    await connectToDatabase();
    await Announcement.findByIdAndDelete(id);
    return true;
}

export async function toggleAnnouncement(id: string) {
    await connectToDatabase();
    const announcement = await Announcement.findById(id);
    if (announcement) {
        announcement.isActive = !announcement.isActive;
        await announcement.save();
        return true;
    }
    return false;
}
