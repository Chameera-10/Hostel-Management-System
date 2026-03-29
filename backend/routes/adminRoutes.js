
const express = require('express');
const router = express.Router();
const { getDashboardStats, getSystemReports } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/dashboard/stats', protect, admin, getDashboardStats);
router.get('/reports', protect, admin, getSystemReports);

module.exports = router;
