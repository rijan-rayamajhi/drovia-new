import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
