
const User = require('../models/userModel');
const Payment = require('../models/paymentModel');
const MaintenanceRequest = require('../models/maintenanceRequestModel');
const ClearanceRequest = require('../models/clearanceRequestModel');
const Room = require('../models/roomModel');
const mongoose = require('mongoose');
const Settings = require('../models/settingsModel');
const sendEmail = require('../utils/emailService');

// @desc    Get a student's profile
// @route   GET /api/students/:id/profile
// @access  Private
const getStudentProfile = async (req, res) => {
    // A student can only get their own profile, a warden/admin can get any student's profile
    if (req.user.role === 'student' && req.user.id !== req.params.id) {
        return res.status(403).json({ message: "Not authorized to view this profile" });
    }
    
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user && user.role === 'student') {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update a student's profile
// @route   PATCH /api/students/:id/profile
// @access  Private
const updateStudentProfile = async (req, res) => {
    if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: "You can only update your own profile" });
    }

    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.phone = req.body.phone || user.phone;
            user.guardianContact = req.body.guardianContact || user.guardianContact;
            user.emergencyContact = req.body.emergencyContact || user.emergencyContact;
            
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get a student's payments
// @route   GET /api/students/:id/payments
// @access  Private
const getStudentPayments = async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Get settings from the database
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({}); // Create default settings if none exist
        }
        
        // Check if a payment record for the student's current year exists
        const paymentForCurrentYear = await Payment.findOne({
            student: req.params.id,
            academicYear: student.year
        });

        if (!paymentForCurrentYear) {
            // If no payment record for the current academic year, create one
            await Payment.create({
                student: req.params.id,
                amount: settings.defaultHostelFee,
                status: 'Pending',
                academicYear: student.year,
            });
        }
        
        // Return all payments for the student, sorted by year descending
        const payments = await Payment.find({ student: req.params.id }).sort({ academicYear: -1 });
        res.json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get a student's maintenance requests
// @route   GET /api/students/:id/maintenance
// @access  Private
const getStudentMaintenanceRequests = async (req, res) => {
    try {
        const requests = await MaintenanceRequest.find({ student: req.params.id }).sort({ submittedAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get a student's clearance status
// @route   GET /api/students/:id/clearance
// @access  Private
const getStudentClearance = async (req, res) => {
    try {
        let request = await ClearanceRequest.findOne({ student: req.params.id });
        if (!request) {
            // If no request exists, return a "Not Started" status
            return res.json({ status: 'Not Started', steps: [] });
        }
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Student applies for clearance
// @route   POST /api/students/:id/clearance
// @access  Private
const applyForClearance = async (req, res) => {
    const studentId = req.params.id;
    try {
        const existingRequest = await ClearanceRequest.findOne({ student: studentId });
        if (existingRequest) {
            return res.status(400).json({ message: 'Clearance application already exists.' });
        }
        
        // Real check for fee dues from the database
        const pendingPayment = await Payment.findOne({ student: studentId, status: 'Pending' });
        const hasDues = !!pendingPayment; // true if a pending payment is found, false otherwise
        
        const newRequest = await ClearanceRequest.create({
            student: studentId,
            status: 'Pending',
            steps: [
                {
                    name: 'Hostel Fee Dues',
                    status: hasDues ? 'rejected' : 'approved',
                    remarks: hasDues ? `Outstanding payment of LKR ${pendingPayment.amount.toFixed(2)} for academic year ${pendingPayment.academicYear} detected.` : 'No pending dues found.'
                },
                {
                    name: 'Room Inspection',
                    status: 'pending',
                    remarks: 'Awaiting warden inspection.'
                }
            ]
        });

        // If the fee status is rejected, the overall status should also be Rejected.
        if (hasDues) {
            newRequest.status = 'Rejected';
            await newRequest.save();
        }

        res.status(201).json(newRequest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error while applying for clearance' });
    }
};

// @desc    Unassign a student from a room
// @route   POST /api/students/:id/unassign
// @access  Private/Warden
const unassignStudent = async (req, res) => {
    const studentId = req.params.id;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const student = await User.findById(studentId).session(session);
        if (!student || !student.roomNumber) {
            throw new Error('Student not found or not assigned to any room');
        }

        const room = await Room.findOne({ roomNumber: student.roomNumber }).session(session);
        if (room) {
            room.occupants.pull(studentId);
            await room.save({ session });
        }

        student.roomNumber = null;
        await student.save({ session });

        await session.commitTransaction();
        res.json({ success: true });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message || 'Unassignment failed' });
    } finally {
        session.endSession();
    }
};

// @desc    Get students not assigned to a room
// @route   GET /api/students?unassigned=true
// @access  Private/Warden
const getUnassignedStudents = async (req, res) => {
    if (req.query.unassigned === 'true') {
        try {
            const students = await User.find({ role: 'student', roomNumber: null, accountStatus: 'approved' }).select('-password');
            res.json(students);
        } catch (error) {
            res.status(500).json({ message: 'Server Error' });
        }
    } else {
        // This route is only for unassigned students in this controller
        res.status(400).json({ message: 'Invalid query' });
    }
};

// @desc    Simulate paying for a hostel fee
// @route   POST /api/students/:id/payments/:paymentId/pay
// @access  Private
const payHostelFee = async (req, res) => {
    try {
        // Ensure student can only pay for their own fees
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ message: "Not authorized to make this payment" });
        }
        
        const payment = await Payment.findOne({ _id: req.params.paymentId, student: req.params.id });

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        if (payment.status === 'Paid') {
            return res.status(400).json({ message: 'This payment has already been made.' });
        }

        payment.status = 'Paid';
        await payment.save();

        // After payment, check if this resolves a clearance rejection.
        const remainingDues = await Payment.findOne({ student: req.params.id, status: 'Pending' });

        if (!remainingDues) {
            const clearanceRequest = await ClearanceRequest.findOne({ student: req.params.id });

            if (clearanceRequest) {
                const feeStep = clearanceRequest.steps.find(step => step.name === 'Hostel Fee Dues');
                if (feeStep && feeStep.status !== 'approved') {
                    feeStep.status = 'approved';
                    feeStep.remarks = 'All pending dues have been cleared.';
                    
                    // Re-evaluate overall clearance status
                    const anyStepRejected = clearanceRequest.steps.some(step => step.status === 'rejected');
                    const allStepsApproved = clearanceRequest.steps.every(step => step.status === 'approved');

                    if (anyStepRejected) {
                        clearanceRequest.status = 'Rejected';
                    } else if (allStepsApproved) {
                        clearanceRequest.status = 'Approved';
                    } else {
                        clearanceRequest.status = 'Pending';
                    }
                    
                    await clearanceRequest.save();
                }
            }
        }

        res.json(payment);

        // Send invoice email after successful payment and response
        const student = await User.findById(req.params.id);
        if (student) {
            try {
                const invoiceHtml = `
                    <html>
                        <head>
                            <title>Invoice - ${payment.id}</title>
                            <style>
                                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 2rem; color: #333; }
                                .invoice-box { max-width: 800px; margin: auto; padding: 2rem; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; line-height: 24px; }
                                .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
                                .header img { width: 80px; height: 80px; }
                                .header .title { text-align: right; }
                                .title h1 { color: #14654d; margin: 0; font-size: 2.5rem; }
                                .title p { margin: 0; color: #555; font-size: 0.9rem; }
                                .student-details { margin-bottom: 2rem; }
                                .student-details p { margin: 0.25rem 0; }
                                .invoice-table { width: 100%; text-align: left; border-collapse: collapse; }
                                .invoice-table thead tr { background-color: #14654d; color: #fff; }
                                .invoice-table th, .invoice-table td { padding: 0.75rem; }
                                .invoice-table tbody tr { border-bottom: 1px solid #eee; }
                                .total-section { text-align: right; margin-top: 2rem; }
                                .total-section p { font-size: 1.2rem; font-weight: bold; margin: 0.5rem 0; }
                                .status { font-size: 1.5rem; font-weight: bold; margin-top: -1rem; margin-bottom: 1rem; }
                                .status.paid { color: #22c55e; }
                                .footer { margin-top: 3rem; text-align: center; font-size: 0.8rem; color: #777; }
                            </style>
                        </head>
                        <body>
                            <div class="invoice-box">
                                <div class="header">
                                    <div>
                                        <img src="https://www.rjt.ac.lk/images/logo.png" alt="Rajarata University Logo" />
                                        <p><strong>Rajarata University of Sri Lanka</strong></p>
                                        <p>Faculty of Technology</p>
                                    </div>
                                    <div class="title">
                                        <h1>INVOICE</h1>
                                        <p>Invoice #: ${payment.id}</p>
                                        <p>Issued: ${new Date(payment.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div class="student-details">
                                    <p><strong>Bill To:</strong></p>
                                    <p>${student.name}</p>
                                    <p>${student.studentId}</p>
                                    <p>${student.email}</p>
                                    <p>Room: ${student.roomNumber || 'N/A'}</p>
                                </div>
                                <table class="invoice-table">
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th>Amount (LKR)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Hostel Fee - Academic Year ${payment.academicYear}</td>
                                            <td>${payment.amount.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="total-section">
                                    <p class="status paid">Status: Paid</p>
                                    <p>Total: LKR ${payment.amount.toFixed(2)}</p>
                                </div>
                                <div class="footer">
                                    <p>Thank you for your payment.</p>
                                    <p>If you have any questions, please contact the hostel administration.</p>
                                </div>
                            </div>
                        </body>
                    </html>
                `;
                await sendEmail({
                    to: student.email,
                    subject: `Payment Invoice for Hostel Fee - Year ${payment.academicYear}`,
                    html: invoiceHtml
                });
            } catch (emailError) {
                console.error(`Failed to send invoice email for payment ${payment.id}:`, emailError);
            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error during payment process" });
    }
};


module.exports = {
    getStudentProfile,
    updateStudentProfile,
    getStudentPayments,
    getStudentMaintenanceRequests,
    getStudentClearance,
    applyForClearance,
    unassignStudent,
    getUnassignedStudents,
    payHostelFee,
};