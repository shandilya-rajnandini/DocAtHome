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

// --- Production-Ready CORS Configuration ---
const allowedOrigins = [
    "http://localhost:5173", // For your local development frontend
    "https://docathome-rajnandini.netlify.app" // Your live frontend URL
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions));
// Middleware to parse JSON request bodies
app.use(express.json());


// --- Socket.IO Configuration ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Basic Socket.IO connection logic
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});


// --- API Route Definitions (ALL ROUTES INCLUDED) ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/nurses', require('./routes/nurseRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/lab-tests', require('./routes/labTestRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));


// --- Error Handling Middleware ---
// 404 Not Found handler (if no route matched)
app.use((req, res, next) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Global error handler (for any other errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});


// --- Server Startup ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to the database
    await connectDB();
    
    // 2. Start listening for requests
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('FATAL ERROR: Could not connect to the database.');
    console.error(error);
    process.exit(1);
  }
};

startServer();