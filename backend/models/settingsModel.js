const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema({
    appName: {
        type: String,
        required: true,
        default: "Rajarata University Hostel Management"
    },
    defaultHostelFee: {
        type: Number,
        required: true,
        default: 15000
    },
    enableEmailNotifications: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        }
    }
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
