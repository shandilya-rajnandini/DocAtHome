const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet'); // Security best practice
const connectDB = require('./config/db');

// It's good practice to import all your own modules after third-party ones
const { globalErrorHandler } = require('./middleware/errorHandler');

// Load environment variables from .env file
dotenv.config();

// Initialize Express App
const app = express();

// --- Production-Ready CORS Configuration ---
const allowedOrigins = [
    "http://localhost:5173", // For your local development frontend
    "https://docathome-rajnandini.netlify.app" // Your live frontend URL
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or server-to-server requests)
        // and requests from our allowlist.
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error(`CORS ERROR: The origin '${origin}' was blocked.`);
            callback(new Error('This origin is not allowed by CORS'));
        }
    },
    credentials: true
};

// --- Core Middleware ---
app.use(helmet()); // Sets various security-related HTTP headers
app.use(cors(corsOptions)); // Apply the CORS policy
app.use(express.json()); // Middleware to parse incoming JSON request bodies


// --- API Route Definitions ---
// Make sure all these route files exist in your `backend/routes` folder and are spelled correctly.
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/nurses', require('./routes/nurseRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/lab-tests', require('./routes/labTestRoutes'));
// The payment route is commented out to prevent crashes if keys are missing.
// app.use('/api/payment', require('./routes/paymentRoutes')); 


// --- Health Check Route for Hosting Provider ---
app.get('/health', (req, res) => res.status(200).send('OK'));


// --- Error Handling Middleware ---
// 404 Not Found handler (runs if no other route matches)
app.use((req, res, next) => {
  const err = new Error(`API endpoint not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
});

// Global error handler (catches all errors passed by `next(err)`)
app.use(globalErrorHandler);


// --- Server and Socket.IO Startup ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: allowedOrigins, 
    methods: ["GET", "POST"] 
  }
});

io.on('connection', (socket) => {
  console.log(`User Connected via Socket: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`User Disconnected via Socket: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Attempt to connect to the database first
    await connectDB();
    
    // 2. Only if the DB connection is successful, start the HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 Server is live and running on port ${PORT}`);
    });
  } catch (error) {
    // 3. If the DB connection fails, log the fatal error and stop the application
    console.error('FATAL ERROR: Could not connect to the database.');
    console.error(error);
    process.exit(1);
  }
};

// Execute the startup function
startServer();