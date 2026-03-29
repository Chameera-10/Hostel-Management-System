
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await User.deleteMany({ role: 'admin' });

        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@hostel.com',
            password: '123456', // This will be hashed by the model's pre-save hook
            role: 'admin',
            accountStatus: 'approved',
            phone: '0000000000',
            adminId: 'ADMIN001'
        });

        console.log('Admin User Imported!');
        console.log('Email: admin@hostel.com');
        console.log('Password: 123456');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany({ role: 'admin' });
        console.log('Admin users destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    if (process.argv[2] === '-d') {
        await destroyData();
    } else {
        await importData();
    }
};

run();
