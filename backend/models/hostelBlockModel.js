
const mongoose = require('mongoose');

const hostelBlockSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    }
}, {
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

const HostelBlock = mongoose.model('HostelBlock', hostelBlockSchema);
module.exports = HostelBlock;