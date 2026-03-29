
const User = require('../models/userModel');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get pending users (students for warden, wardens for admin)
// @route   GET /api/users/pending
// @access  Private/Warden or Admin
const getPendingUsers = async (req, res) => {
    const roleToFetch = req.user.role === 'admin' ? 'warden' : 'student';
    try {
        const pendingUsers = await User.find({ role: roleToFetch, accountStatus: 'pending' }).select('-password');
        res.json(pendingUsers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve or reject a user
// @route   PATCH /api/users/:id/approve or /api/users/:id/reject
// @access  Private/Warden or Admin
const manageUserApproval = (newStatus) => async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Security check: Admins can manage wardens, Wardens can manage students.
        if (req.user.role === 'admin' && user.role !== 'warden') {
             return res.status(403).json({ message: 'Admins can only manage wardens.' });
        }
        if (req.user.role === 'warden' && user.role !== 'student') {
             return res.status(403).json({ message: 'Wardens can only manage students.' });
        }

        user.accountStatus = newStatus;
        await user.save();
        res.json({ message: `User status updated to ${newStatus}` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Toggle user status between approved and disabled
// @route   PATCH /api/users/:id/toggle-status
// @access  Private/Warden or Admin
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.user.role === 'admin' && user.role !== 'warden') {
             return res.status(403).json({ message: 'Admins can only manage wardens.' });
        }
        if (req.user.role === 'warden' && user.role !== 'student') {
             return res.status(403).json({ message: 'Wardens can only manage students.' });
        }

        if (user.accountStatus === 'approved') {
            user.accountStatus = 'disabled';
        } else if (user.accountStatus === 'disabled') {
            user.accountStatus = 'approved';
        } else {
            return res.status(400).json({ message: 'Can only toggle status for approved/disabled users.' });
        }

        await user.save();
        res.json({ message: `User status updated to ${user.accountStatus}` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAllUsers,
    getPendingUsers,
    manageUserApproval,
    toggleUserStatus,
};
