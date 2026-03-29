
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new student
// @route   POST /api/auth/register/student
// @access  Public
const registerStudent = async (req, res) => {
    const { name, email, phone, studentId, course, guardianContact, emergencyContact, password } = req.body;
    
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const studentIdExists = await User.findOne({ studentId });
        if (studentIdExists) {
            return res.status(400).json({ message: 'User with this Student ID already exists' });
        }

        const user = await User.create({
            name,
            email,
            phone,
            studentId,
            course,
            guardianContact,
            emergencyContact,
            password, // Password is now required for students
            role: 'student',
            accountStatus: 'pending'
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during student registration' });
    }
};


// @desc    Register a new warden
// @route   POST /api/auth/register/warden
// @access  Public
const registerWarden = async (req, res) => {
    const { name, email, phone, wardenId, username, password } = req.body;

    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }
        
        const user = await User.create({
            name,
            email,
            phone,
            wardenId,
            username,
            password,
            role: 'warden',
            accountStatus: 'pending'
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error during warden registration' });
    }
};


// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Allow login with either email (for all roles) or username (for wardens)
        const user = await User.findOne({ $or: [{ email }, { username: email }] });

        if (user && (await user.matchPassword(password))) {
             if (user.accountStatus === 'pending') {
                return res.status(401).json({ message: 'Your account is pending approval.' });
            }
             if (user.accountStatus === 'disabled') {
                return res.status(401).json({ message: 'Your account has been disabled.' });
            }
             if (user.accountStatus === 'rejected') {
                return res.status(401).json({ message: 'Your registration was rejected.' });
            }

            res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    accountStatus: user.accountStatus,
                },
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    // req.user is set by the protect middleware
    const user = {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        accountStatus: req.user.accountStatus,
    };
    res.status(200).json(user);
};


module.exports = {
    registerStudent,
    registerWarden,
    loginUser,
    getMe,
};