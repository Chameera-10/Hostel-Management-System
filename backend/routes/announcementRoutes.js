
const express = require('express');
const router = express.Router();
const {
    createAnnouncement,
    getAllAnnouncements,
    getWardenAnnouncements,
    getStudentAnnouncements,
    updateAnnouncement,
    deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, admin, warden } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, warden, createAnnouncement) // Wardens and Admins can create
    .get(protect, admin, getAllAnnouncements);

router.get('/warden', protect, warden, getWardenAnnouncements);
router.get('/student', protect, getStudentAnnouncements);

router.route('/:id')
    .patch(protect, warden, updateAnnouncement) // Wardens and Admins can update
    .delete(protect, warden, deleteAnnouncement); // Wardens and Admins can delete

module.exports = router;
