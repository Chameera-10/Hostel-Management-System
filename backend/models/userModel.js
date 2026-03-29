
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, required: true, enum: ['student', 'warden', 'admin'] },
        accountStatus: { type: String, required: true, enum: ['pending', 'approved', 'disabled', 'rejected'], default: 'pending' },
        phone: { type: String, required: true },
        
        // Student specific
        studentId: { type: String, unique: true, sparse: true },
        course: { type: String },
        guardianContact: { type: String },
        emergencyContact: { type: String },
        roomNumber: { type: String, default: null },
        faculty: { type: String, default: 'Faculty of Technology' },
        year: { type: Number, default: 1 },

        // Warden specific
        wardenId: { type: String, unique: true, sparse: true },
        username: { type: String, unique: true, sparse: true },
        hostelManaged: { type: String },

        // Admin specific
        adminId: { type: String, unique: true, sparse: true },

    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                delete ret.password; // Ensure password hash is not sent
            }
        }
    }
);

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;