import mongoose, { Schema, model, models } from 'mongoose';

const SettingsSchema = new Schema({
    shippingEnabled: {
        type: Boolean,
        default: true,
    },
    shippingCharge: {
        type: Number,
        default: 99,
    },
    freeShippingThreshold: {
        type: Number,
        default: 2000,
    },
}, {
    timestamps: true,
});

const Settings = models.Settings || model('Settings', SettingsSchema);

export default Settings;
