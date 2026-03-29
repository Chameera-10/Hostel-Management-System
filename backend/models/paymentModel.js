const mongoose =require('mongoose');

const paymentSchema = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    academicYear: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending'
    },
    invoiceUrl: {
        type: String
    },
    slipUrl: {
        type: String
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

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;