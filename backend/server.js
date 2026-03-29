
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies

// API Routes
app.get('/api', (req, res) => {
    res.send('Hostel Management API is running...');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/wardens', require('./routes/wardenRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/clearance', require('./routes/clearanceRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Backend server started on port ${PORT}`));