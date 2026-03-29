
const User = require('../models/userModel');
const Room = require('../models/roomModel');
const MaintenanceRequest = require('../models/maintenanceRequestModel');
const ClearanceRequest = require('../models/clearanceRequestModel');
const StaffMember = require('../models/staffMemberModel');
const StaffTask = require('../models/staffTaskModel');


// @desc    Get statistics for warden dashboard
// @route   GET /api/wardens/dashboard/stats
// @access  Private/Warden
const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student', accountStatus: 'approved' });
        const rooms = await Room.find({});
        const roomStats = rooms.reduce((acc, room) => {
            if (room.occupants.length === 0) acc.empty++;
            else if (room.occupants.length === room.capacity) acc.full++;
            else acc.partial++;
            return acc;
        }, { total: rooms.length, full: 0, partial: 0, empty: 0 });

        const pendingComplaints = await MaintenanceRequest.countDocuments({ status: 'Pending' });
        const pendingClearance = await ClearanceRequest.countDocuments({ status: 'Pending' });

        const complaintStats = [
            { name: 'Pending', value: pendingComplaints },
            { name: 'In Progress', value: await MaintenanceRequest.countDocuments({ status: 'In Progress' }) },
            { name: 'Completed', value: await MaintenanceRequest.countDocuments({ status: 'Completed' }) },
        ];

        res.json({
            totalStudents,
            rooms: roomStats,
            pendingComplaints,
            pendingClearance,
            complaintStats
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};


// @desc    Get all students managed by the warden
// @route   GET /api/wardens/students
// @access  Private/Warden
const getWardenStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student', accountStatus: { $in: ['approved', 'disabled'] } }).select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Staff Management ---
const getStaff = async (req, res) => {
    try {
        const staff = await StaffMember.find({ warden: req.user._id });
        res.json(staff);
    } catch (e) { res.status(500).json({ message: "Server Error" }) }
};
const addStaff = async (req, res) => {
    try {
        const newStaff = await StaffMember.create({ ...req.body, warden: req.user._id });
        res.status(201).json(newStaff);
    } catch (e) { res.status(400).json({ message: "Invalid data" }) }
};
const updateStaff = async (req, res) => {
    try {
        const staff = await StaffMember.findOneAndUpdate({ _id: req.params.id, warden: req.user._id }, req.body, { new: true });
        if (!staff) return res.status(404).json({ message: "Staff not found" });
        res.json(staff);
    } catch (e) { res.status(400).json({ message: "Invalid data" }) }
};
const deleteStaff = async (req, res) => {
    try {
        const staff = await StaffMember.findOneAndDelete({ _id: req.params.id, warden: req.user._id });
        if (!staff) return res.status(404).json({ message: "Staff not found" });
        // Also delete their tasks
        await StaffTask.deleteMany({ staffMember: req.params.id });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ message: "Server Error" }) }
};

// --- Task Management ---
const getTasks = async (req, res) => {
    try {
        const tasks = await StaffTask.find({ warden: req.user._id });
        const formattedTasks = tasks.map(t => ({
            id: t._id,
            description: t.description,
            staffMemberId: t.staffMember,
            status: t.status,
            assignedAt: t.assignedAt,
            completedAt: t.completedAt
        }));
        res.json(formattedTasks);
    } catch (e) { res.status(500).json({ message: "Server Error" }) }
};
const addTask = async (req, res) => {
    const { description, staffMemberId } = req.body;
    try {
        const newTask = await StaffTask.create({ description, staffMember: staffMemberId, warden: req.user._id });
        res.status(201).json({
            id: newTask._id,
            description: newTask.description,
            staffMemberId: newTask.staffMember,
            status: newTask.status,
            assignedAt: newTask.assignedAt,
        });
    } catch (e) { res.status(400).json({ message: "Invalid data" }) }
};
const updateTask = async (req, res) => {
    try {
        const task = await StaffTask.findOne({ _id: req.params.id, warden: req.user._id });
        if (!task) return res.status(404).json({ message: "Task not found" });

        task.description = req.body.description || task.description;
        task.staffMember = req.body.staffMemberId || task.staffMember;
        task.status = req.body.status || task.status;
        if (req.body.status === 'Completed') {
            task.completedAt = new Date();
        } else {
            task.completedAt = null;
        }
        await task.save();
        res.json(task);
    } catch (e) { res.status(400).json({ message: "Invalid data" }) }
};
const deleteTask = async (req, res) => {
    try {
        const task = await StaffTask.findOneAndDelete({ _id: req.params.id, warden: req.user._id });
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ message: "Server Error" }) }
};

module.exports = {
    getDashboardStats,
    getWardenStudents,
    getStaff, addStaff, updateStaff, deleteStaff,
    getTasks, addTask, updateTask, deleteTask
};
