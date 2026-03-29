const express = require('express');
const router = express.Router();
const {
    getStudentProfile,
    updateStudentProfile,
    getStudentPayments,
    getStudentMaintenanceRequests,
    getStudentClearance,
    applyForClearance,
    unassignStudent,
    getUnassignedStudents,
    payHostelFee,
} = require('../controllers/studentController');
const { protect, warden } = require('../middleware/authMiddleware');

// For Wardens to get unassigned students
router.get('/', protect, warden, getUnassignedStudents);

router.route('/:id/profile')
    .get(protect, getStudentProfile)
    .patch(protect, updateStudentProfile);

router.get('/:id/payments', protect, getStudentPayments);
router.post('/:id/payments/:paymentId/pay', protect, payHostelFee);

router.get('/:id/maintenance', protect, getStudentMaintenanceRequests);

router.route('/:id/clearance')
    .get(protect, getStudentClearance)
    .post(protect, applyForClearance); // Route for applying is combined here for simplicity

// For Wardens to unassign a student
router.post('/:id/unassign', protect, warden, unassignStudent);


module.exports = router;