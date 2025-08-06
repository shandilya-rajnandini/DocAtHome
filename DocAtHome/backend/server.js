const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Core Middleware
app.use(cors());
app.use(express.json());

// Socket.IO Connection Logic
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);
  socket.on('join_room', (data) => socket.join(data));
  socket.on('send_message', (data) => socket.to(data.room).emit('receive_message', data));
  socket.on('disconnect', () => console.log('User Disconnected', socket.id));
});

// API Route Definitions
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/nurses', require('./routes/nurseRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/lab-tests', require('./routes/labTestRoutes')); // <-- New Lab Test Route
app.use('/api/payment', require('./routes/paymentRoutes'));
// Server Port
const PORT = process.env.PORT || 5000;

// Strict Server Startup Function
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running with chat on port ${PORT}`);
    });
  } catch (error) {
    console.error('FATAL ERROR: Could not connect to the database.', error);
    process.exit(1);
  }
};

startServer();