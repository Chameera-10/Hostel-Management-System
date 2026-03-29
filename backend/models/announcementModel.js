
const mongoose = require('mongoose');

const announcementSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String, // Storing author name directly for simplicity
        required: true
    },
    audience: {
        type: [String], // Array of roles: ['student', 'warden', 'admin'] or just 'all'
        required: true
    }
}, {
    timestamps: { createdAt: 'date' },
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

const Announcement = mongoose.model('Announcement', announcementSchema);
module.exports = Announcement;