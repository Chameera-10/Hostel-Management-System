
const express = require('express');
const router = express.Router();
const { getInventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem } = require('../controllers/inventoryController');
const { protect, warden } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, warden, getInventoryItems)
    .post(protect, warden, addInventoryItem);

router.route('/:id')
    .patch(protect, warden, updateInventoryItem)
    .delete(protect, warden, deleteInventoryItem);

module.exports = router;
