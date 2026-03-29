
const ClearanceRequest = require('../models/clearanceRequestModel');
const User = require('../models/userModel');

// @desc    Get all clearance requests for the warden
// @route   GET /api/clearance
// @access  Private/Warden
const getClearanceRequests = async (req, res) => {
    try {
        const requests = await ClearanceRequest.find({}).populate('student', 'name');
        
        const formattedRequests = requests.map(r => ({
            id: r._id,
            studentId: r.student._id,
            studentName: r.student.name,
            status: r.status,
            steps: r.steps,
            appliedAt: r.appliedAt
        }));

        res.json(formattedRequests);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};


// @desc    Update room inspection status for a clearance request
// @route   PATCH /api/clearance/:id/inspection
// @access  Private/Warden
const updateInspectionStatus = async (req, res) => {
    const { status, remarks } = req.body; // status is 'approved' or 'rejected'

    try {
        const request = await ClearanceRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Clearance request not found' });
        }

        const inspectionStep = request.steps.find(step => step.name === 'Room Inspection');
        if (!inspectionStep) {
            return res.status(400).json({ message: 'Room inspection step not found in this request' });
        }

        inspectionStep.status = status;
        inspectionStep.remarks = remarks;
        
        // Check if all steps are approved to update the main status
        const allApproved = request.steps.every(step => step.status === 'approved');
        if (allApproved) {
            request.status = 'Approved';
        } else if (status === 'rejected') {
            request.status = 'Rejected';
        }

        await request.save();
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getClearanceRequests,
    updateInspectionStatus
};
