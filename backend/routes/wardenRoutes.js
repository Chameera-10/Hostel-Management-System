
const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getWardenStudents,
    getStaff,
    addStaff,
    updateStaff,
    deleteStaff,
    getTasks,
    addTask,
    updateTask,
    deleteTask
} = require('../controllers/wardenController');
const { protect, warden } = require('../middleware/authMiddleware');

router.get('/dashboard/stats', protect, warden, getDashboardStats);
router.get('/students', protect, warden, getWardenStudents);

// Staff Management
router.route('/staff')
    .get(protect, warden, getStaff)
    .post(protect, warden, addStaff);

router.route('/staff/:id')
    .patch(protect, warden, updateStaff)
    .delete(protect, warden, deleteStaff);

// Task Management
router.route('/tasks')
    .get(protect, warden, getTasks)
    .post(protect, warden, addTask);

router.route('/tasks/:id')
    .patch(protect, warden, updateTask)
    .delete(protect, warden, deleteTask);


module.exports = router;
