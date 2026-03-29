
const express = require('express');
const router = express.Router();
const { checkChatStatus, sendChatMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/status', checkChatStatus);
router.post('/send', protect, sendChatMessage);

module.exports = router;
