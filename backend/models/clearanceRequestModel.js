
const mongoose = require('mongoose');

const clearanceStepSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Hostel Fee Dues', 'Room Inspection']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    remarks: {
        type: String,
        default: ''
    }
}, { _id: false });

const clearanceRequestSchema = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Approved', 'Rejected'],
    },
    steps: [clearanceStepSchema]
}, {
    timestamps: { createdAt: 'appliedAt' },
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

const ClearanceRequest = mongoose.model('ClearanceRequest', clearanceRequestSchema);
module.exports = ClearanceRequest;