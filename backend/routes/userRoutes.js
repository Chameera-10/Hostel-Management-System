
const express = require('express');
const router = express.Router();
const { getAllUsers, getPendingUsers, manageUserApproval, toggleUserStatus } = require('../controllers/userController');
const { protect, admin, warden } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getAllUsers);
router.get('/pending', protect, warden, getPendingUsers); // Warden can get pending students, admin can get pending wardens
router.patch('/:id/approve', protect, warden, manageUserApproval('approved'));
router.patch('/:id/reject', protect, warden, manageUserApproval('rejected'));
router.patch('/:id/toggle-status', protect, warden, toggleUserStatus);

module.exports = router;
