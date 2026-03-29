
const express = require('express');
const router = express.Router();
const {
    getAllRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    assignStudentToRoom
} = require('../controllers/roomController');
const { protect, warden } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, warden, getAllRooms)
    .post(protect, warden, createRoom);

router.route('/:id')
    .patch(protect, warden, updateRoom)
    .delete(protect, warden, deleteRoom);
    
router.post('/:id/assign', protect, warden, assignStudentToRoom);

module.exports = router;
