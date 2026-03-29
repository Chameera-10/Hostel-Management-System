
const express = require('express');
const router = express.Router();
const { getClearanceRequests, updateInspectionStatus } = require('../controllers/clearanceController');
const { protect, warden } = require('../middleware/authMiddleware');

router.get('/', protect, warden, getClearanceRequests);
router.patch('/:id/inspection', protect, warden, updateInspectionStatus);

module.exports = router;
