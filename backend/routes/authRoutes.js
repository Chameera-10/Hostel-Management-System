
const express = require('express');
const router = express.Router();
const { registerStudent, registerWarden, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register/student', registerStudent);
router.post('/register/warden', registerWarden);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

module.exports = router;
