
const User = require('../models/userModel');
const Room = require('../models/roomModel');
const MaintenanceRequest = require('../models/maintenanceRequestModel');
const Payment = require('../models/paymentModel');
const ClearanceRequest = require('../models/clearanceRequestModel');

// @desc    Get statistics for the admin dashboard
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalWardens = await User.countDocuments({ role: 'warden' });
        
        const rooms = await Room.find({});
        const totalCapacity = rooms.reduce((acc, room) => acc + room.capacity, 0);
        const totalOccupants = rooms.reduce((acc, room) => acc + room.occupants.length, 0);
        const roomOccupancy = totalCapacity > 0 ? (totalOccupants / totalCapacity) * 100 : 0;

        const pendingRequests = await MaintenanceRequest.countDocuments({ status: 'Pending' });

        // Dummy data for charts as an example
        const financialReport = [
            { name: 'Jan', paid: 4000, pending: 2400 },
            { name: 'Feb', paid: 3000, pending: 1398 },
            { name: 'Mar', paid: 2000, pending: 9800 },
        ];
        const complaintStats = [
            { name: 'Pending', value: await MaintenanceRequest.countDocuments({ status: 'Pending' }) },
            { name: 'In Progress', value: await MaintenanceRequest.countDocuments({ status: 'In Progress' }) },
            { name: 'Completed', value: await MaintenanceRequest.countDocuments({ status: 'Completed' }) },
        ];

        res.json({
            totalStudents,
            totalWardens,
            roomOccupancy,
            pendingRequests,
            financialReport,
            complaintStats
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};


// @desc    Get data for system reports page
// @route   GET /api/admin/reports
// @access  Private/Admin
const getSystemReports = async (req, res) => {
    try {
        // This is a simplified example. A real implementation would involve complex aggregation.
        const occupancyTrends = [
            { name: 'Jan', occupancy: 65 }, { name: 'Feb', occupancy: 70 },
            { name: 'Mar', occupancy: 80 }, { name: 'Apr', occupancy: 75 },
            { name: 'May', occupancy: 85 }, { name: 'Jun', occupancy: 90 },
        ];

        const financialSummary = [
            { name: 'Jan', paid: 400000, pending: 24000 },
            { name: 'Feb', paid: 300000, pending: 13980 },
            { name: 'Mar', paid: 550000, pending: 35000 },
        ];

        const maintenanceAnalysis = [
            { name: 'Plumbing', count: 12 },
            { name: 'Electrical', count: 25 },
            { name: 'Carpentry', count: 5 },
            { name: 'Other', count: 18 },
        ];

        const recentRegistrations = await User.find({ accountStatus: 'pending' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email role accountStatus');
        
        const registrationsFormatted = recentRegistrations.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            type: u.role,
            status: u.accountStatus,
        }));

        res.json({
            occupancyTrends,
            financialSummary,
            maintenanceAnalysis,
            recentRegistrations: registrationsFormatted
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { getDashboardStats, getSystemReports };
