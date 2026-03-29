
const Room = require('../models/roomModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const sendEmail = require('../utils/emailService');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private/Warden
const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find({});
        const formattedRooms = rooms.map(room => ({
            id: room._id,
            roomNumber: room.roomNumber,
            capacity: room.capacity,
            occupants: room.occupants,
        }));
        res.json(formattedRooms);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private/Warden
const createRoom = async (req, res) => {
    const { roomNumber, capacity } = req.body;
    try {
        const roomExists = await Room.findOne({ roomNumber });
        if (roomExists) {
            return res.status(400).json({ message: 'Room number already exists' });
        }
        const room = new Room({ roomNumber, capacity, occupants: [] });
        const createdRoom = await room.save();
        res.status(201).json({
            id: createdRoom._id,
            roomNumber: createdRoom.roomNumber,
            capacity: createdRoom.capacity,
            occupants: createdRoom.occupants
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a room
// @route   PATCH /api/rooms/:id
// @access  Private/Warden
const updateRoom = async (req, res) => {
    const { capacity } = req.body;
    try {
        const room = await Room.findById(req.params.id);
        if (room) {
            if (capacity < room.occupants.length) {
                return res.status(400).json({ message: 'Capacity cannot be less than current occupants' });
            }
            room.capacity = capacity || room.capacity;
            const updatedRoom = await room.save();
            res.json(updatedRoom);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Warden
const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (room) {
            if (room.occupants.length > 0) {
                return res.status(400).json({ message: 'Cannot delete a room with occupants' });
            }
            await room.deleteOne();
            res.json({ success: true, message: 'Room deleted' });
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Assign a student to a room
// @route   POST /api/rooms/:id/assign
// @access  Private/Warden
const assignStudentToRoom = async (req, res) => {
    const { studentId } = req.body;
    const roomId = req.params.id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const room = await Room.findById(roomId).session(session);
        const student = await User.findById(studentId).session(session);

        if (!room || !student) {
            throw new Error('Room or Student not found');
        }

        if (room.occupants.length >= room.capacity) {
            throw new Error('Room is already full');
        }
        if (student.roomNumber) {
            throw new Error('Student is already assigned to a room');
        }

        // Add student to new room
        room.occupants.push(studentId);
        await room.save({ session });

        // Update student's profile
        student.roomNumber = room.roomNumber;
        await student.save({ session });

        await session.commitTransaction();
        res.json({ success: true });

        // Send email notification after the transaction is successful
        try {
            await sendEmail({
                to: student.email,
                subject: 'Hostel Room Assignment Confirmation',
                html: `
                    <h1>Welcome to Your New Room!</h1>
                    <p>Dear ${student.name},</p>
                    <p>You have been successfully assigned to <strong>Room ${room.roomNumber}</strong>.</p>
                    <p>We hope you have a comfortable stay.</p>
                    <br>
                    <p>Best Regards,</p>
                    <p>Hostel Management</p>
                `
            });
        } catch (emailError) {
            console.error("Failed to send room assignment email:", emailError);
            // Don't block the response for email failure
        }

    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message || 'Assignment failed' });
    } finally {
        session.endSession();
    }
};

module.exports = {
    getAllRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    assignStudentToRoom
};