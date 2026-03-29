
const mongoose = require('mongoose');

const staffMemberSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: [
            'Plumber', 'Electrician', 'Carpenter', 'Cleaner / Janitor',
            'Security Guard', 'Cook / Kitchen Staff', 'Laundry Staff',
            'Gardener', 'General Maintenance Worker'
        ]
    },
    contact: {
        type: String,
        required: true
    },
    warden: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { 
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

const StaffMember = mongoose.model('StaffMember', staffMemberSchema);
module.exports = StaffMember;