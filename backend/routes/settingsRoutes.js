
const express = require('express');
const router = express.Router();
const {
    getSettings,
    updateSettings,
    getHostelBlocks,
    addHostelBlock,
    updateHostelBlock,
    deleteHostelBlock
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getSettings)
    .put(protect, admin, updateSettings);

router.route('/blocks')
    .get(protect, admin, getHostelBlocks)
    .post(protect, admin, addHostelBlock);

router.route('/blocks/:id')
    .patch(protect, admin, updateHostelBlock)
    .delete(protect, admin, deleteHostelBlock);

module.exports = router;
