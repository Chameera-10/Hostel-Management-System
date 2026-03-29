
const InventoryItem = require('../models/inventoryItemModel');
const Room = require('../models/roomModel');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private/Warden
const getInventoryItems = async (req, res) => {
    try {
        const items = await InventoryItem.find({}).populate('room', 'roomNumber');
        const formattedItems = items.map(item => ({
            id: item._id,
            name: item.name,
            quantity: item.quantity,
            roomId: item.room ? item.room._id : null
        }));
        res.json(formattedItems);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Add a new inventory item
// @route   POST /api/inventory
// @access  Private/Warden
const addInventoryItem = async (req, res) => {
    const { name, quantity, roomId } = req.body;
    try {
        const item = new InventoryItem({
            name,
            quantity,
            room: roomId || null
        });
        const createdItem = await item.save();
        res.status(201).json({
            id: createdItem._id,
            name: createdItem.name,
            quantity: createdItem.quantity,
            roomId: createdItem.room
        });
    } catch (error) {
        res.status(400).json({ message: "Invalid item data" });
    }
};

// @desc    Update an inventory item
// @route   PATCH /api/inventory/:id
// @access  Private/Warden
const updateInventoryItem = async (req, res) => {
    const { name, quantity, roomId } = req.body;
    try {
        const item = await InventoryItem.findById(req.params.id);
        if (item) {
            item.name = name || item.name;
            item.quantity = quantity ?? item.quantity;
            item.room = roomId === null ? null : (roomId || item.room);
            
            const updatedItem = await item.save();
            res.json({
                id: updatedItem._id,
                name: updatedItem.name,
                quantity: updatedItem.quantity,
                roomId: updatedItem.room
            });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Delete an inventory item
// @route   DELETE /api/inventory/:id
// @access  Private/Warden
const deleteInventoryItem = async (req, res) => {
    try {
        const item = await InventoryItem.findById(req.params.id);
        if (item) {
            await item.deleteOne();
            res.json({ success: true, message: 'Item removed' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getInventoryItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
};
