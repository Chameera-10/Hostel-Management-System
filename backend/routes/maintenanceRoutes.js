
const express = require('express');
const router = express.Router();
const { createMaintenanceRequest, getMaintenanceRequests, updateMaintenanceStatus } = require('../controllers/maintenanceController');
const { protect, warden } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createMaintenanceRequest) // Students create
    .get(protect, warden, getMaintenanceRequests); // Wardens get all

router.patch('/:id/status', protect, warden, updateMaintenanceStatus);

module.exports = router;
