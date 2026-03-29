const HostelBlock = require('../models/hostelBlockModel');
const Settings = require('../models/settingsModel');

// Helper to get or create settings
const getOrCreateSettings = async () => {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({}); // Create with defaults from model
    }
    return settings;
};


// @desc    Get system settings
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: "Server Error fetching settings" });
    }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        const { appName, defaultHostelFee, enableEmailNotifications } = req.body;
        const settingsData = {
             appName: appName,
             defaultHostelFee: Number(defaultHostelFee),
             enableEmailNotifications: enableEmailNotifications,
        }
        
        const updatedSettings = await Settings.findOneAndUpdate(
            {}, // find one
            { $set: settingsData },
            { new: true, upsert: true, runValidators: true } // options: return new doc, create if not exist, run schema validators
        );
        res.json(updatedSettings);
    } catch (error) {
         res.status(500).json({ message: "Server Error updating settings" });
    }
};

// @desc    Get all hostel blocks
// @route   GET /api/settings/blocks
// @access  Private/Admin
const getHostelBlocks = async (req, res) => {
    try {
        const blocks = await HostelBlock.find({});
        res.json(blocks);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Add a hostel block
// @route   POST /api/settings/blocks
// @access  Private/Admin
const addHostelBlock = async (req, res) => {
    const { name } = req.body;
    try {
        const block = new HostelBlock({ name });
        const createdBlock = await block.save();
        res.status(201).json(createdBlock);
    } catch (error) {
        res.status(400).json({ message: "Block name likely already exists." });
    }
};

// @desc    Update a hostel block
// @route   PATCH /api/settings/blocks/:id
// @access  Private/Admin
const updateHostelBlock = async (req, res) => {
    const { name } = req.body;
    try {
        const block = await HostelBlock.findById(req.params.id);
        if (block) {
            block.name = name;
            const updatedBlock = await block.save();
            res.json(updatedBlock);
        } else {
            res.status(404).json({ message: 'Block not found' });
        }
    } catch (error) {
        res.status(400).json({ message: "Block name likely already exists." });
    }
};

// @desc    Delete a hostel block
// @route   DELETE /api/settings/blocks/:id
// @access  Private/Admin
const deleteHostelBlock = async (req, res) => {
    try {
        const block = await HostelBlock.findById(req.params.id);
        if (block) {
            await block.deleteOne();
            res.json({ success: true, message: 'Block removed' });
        } else {
            res.status(404).json({ message: 'Block not found' });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    getHostelBlocks,
    addHostelBlock,
    updateHostelBlock,
    deleteHostelBlock
};
