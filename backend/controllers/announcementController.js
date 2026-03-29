
const Announcement = require('../models/announcementModel');
const User = require('../models/userModel');

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private/Warden or Admin
const createAnnouncement = async (req, res) => {
    const { title, content, audience } = req.body;
    try {
        const announcement = new Announcement({
            title,
            content,
            audience: Array.isArray(audience) ? audience : [audience],
            author: req.user.name,
        });
        const createdAnnouncement = await announcement.save();
        res.status(201).json(createdAnnouncement);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get all announcements (for admin)
// @route   GET /api/announcements
// @access  Private/Admin
const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({}).sort({ date: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get announcements for wardens
// @route   GET /api/announcements/warden
// @access  Private/Warden
const getWardenAnnouncements = async (req, res) => {
    try {
        // Wardens see announcements for 'all', 'warden', or if their role is included.
        const announcements = await Announcement.find({
            $or: [
                { audience: 'all' },
                { audience: 'warden' }
            ]
        }).sort({ date: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get announcements for students
// @route   GET /api/announcements/student
// @access  Private/Student
const getStudentAnnouncements = async (req, res) => {
    try {
        // Students see announcements for 'all', 'student', or if their role is included.
        const announcements = await Announcement.find({
            $or: [
                { audience: 'all' },
                { audience: 'student' }
            ]
        }).sort({ date: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update an announcement
// @route   PATCH /api/announcements/:id
// @access  Private/Warden or Admin
const updateAnnouncement = async (req, res) => {
    const { title, content, audience } = req.body;
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (announcement) {
            // Optional: Check if the user is the author or an admin
            if (announcement.author !== req.user.name && req.user.role !== 'admin') {
                return res.status(403).json({ message: "User not authorized to update this announcement" });
            }

            announcement.title = title || announcement.title;
            announcement.content = content || announcement.content;
            announcement.audience = audience || announcement.audience;

            const updatedAnnouncement = await announcement.save();
            res.json(updatedAnnouncement);
        } else {
            res.status(404).json({ message: 'Announcement not found' });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Warden or Admin
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (announcement) {
             if (announcement.author !== req.user.name && req.user.role !== 'admin') {
                return res.status(403).json({ message: "User not authorized to delete this announcement" });
            }
            await announcement.deleteOne();
            res.json({ success: true, message: 'Announcement removed' });
        } else {
            res.status(404).json({ message: 'Announcement not found' });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};


module.exports = {
    createAnnouncement,
    getAllAnnouncements,
    getWardenAnnouncements,
    getStudentAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
};
