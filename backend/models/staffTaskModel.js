
const mongoose = require('mongoose');

const staffTaskSchema = mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    staffMember: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StaffMember',
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    warden: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: { createdAt: 'assignedAt' },
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

const StaffTask = mongoose.model('StaffTask', staffTaskSchema);
module.exports = StaffTask;