
const MaintenanceRequest = require('../models/maintenanceRequestModel');
const User = require('../models/userModel');
const sendEmail = require('../utils/emailService');

// @desc    Create a new maintenance request
// @route   POST /api/maintenance
// @access  Private/Student
const createMaintenanceRequest = async (req, res) => {
    const { issue, description } = req.body;
    const studentId = req.user._id;

    try {
        const student = await User.findById(studentId);
        if (!student || !student.roomNumber) {
            return res.status(400).json({ message: 'Student is not assigned to a room' });
        }

        const request = new MaintenanceRequest({
            student: studentId,
            roomNumber: student.roomNumber,
            issue,
            description,
        });

        const createdRequest = await request.save();
        res.status(201).json(createdRequest);

        // Send email notification to all wardens
        try {
            const wardens = await User.find({ role: 'warden', accountStatus: 'approved' });
            if (wardens.length > 0) {
                const wardenEmails = wardens.map(w => w.email).join(',');
                await sendEmail({
                    to: wardenEmails,
                    subject: `New Maintenance Request: ${issue}`,
                    html: `
                        <h1>New Maintenance Request Submitted</h1>
                        <p>A new maintenance request has been submitted by a student.</p>
                        <ul>
                            <li><strong>Student:</strong> ${student.name}</li>
                            <li><strong>Room:</strong> ${student.roomNumber}</li>
                            <li><strong>Issue:</strong> ${issue}</li>
                            <li><strong>Description:</strong> ${description}</li>
                        </ul>
                        <p>Please log in to the warden dashboard to view and manage this request.</p>
                    `
                });
            }
        } catch (emailError) {
            console.error("Failed to send new maintenance request email to wardens:", emailError);
        }

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get all maintenance requests for a warden
// @route   GET /api/maintenance
// @access  Private/Warden
const getMaintenanceRequests = async (req, res) => {
    try {
        const requests = await MaintenanceRequest.find({}).populate('student', 'name').sort({ submittedAt: -1 });

        const formattedRequests = requests.map(r => ({
            id: r._id,
            studentId: r.student._id,
            studentName: r.student.name,
            roomNumber: r.roomNumber,
            issue: r.issue,
            description: r.description,
            status: r.status,
            submittedAt: r.submittedAt,
        }));

        res.json(formattedRequests);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update the status of a maintenance request
// @route   PATCH /api/maintenance/:id/status
// @access  Private/Warden
const updateMaintenanceStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const request = await MaintenanceRequest.findById(req.params.id).populate('student', 'name email');
        if (request) {
            request.status = status;
            const updatedRequest = await request.save();
            res.json(updatedRequest);

            // Send email notification to student
            try {
                await sendEmail({
                    to: request.student.email,
                    subject: `Update on Your Maintenance Request: ${request.issue}`,
                    html: `
                        <h1>Your Maintenance Request has been updated</h1>
                        <p>Dear ${request.student.name},</p>
                        <p>The status of your maintenance request for "<strong>${request.issue}</strong>" has been updated to <strong>${status}</strong>.</p>
                        <p>You can check the details in your student dashboard.</p>
                        <br>
                        <p>Best Regards,</p>
                        <p>Hostel Management</p>
                    `
                });
            } catch (emailError) {
                console.error("Failed to send maintenance status update email:", emailError);
            }

        } else {
            res.status(404).json({ message: 'Request not found' });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    createMaintenanceRequest,
    getMaintenanceRequests,
    updateMaintenanceStatus
};