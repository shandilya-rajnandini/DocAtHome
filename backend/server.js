const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { generalLimiter } = require('./middleware/rateLimiter');
const { 
  globalErrorHandler, 
  handleUnhandledRejection, 
  handleUncaughtException, 
  handleGracefulShutdown,
  logger 
} = require('./middleware/errorHandler');

// Handle uncaught exceptions first
handleUncaughtException();

// Load environment variables from .env file
dotenv.config();

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// --- Production-Ready CORS Configuration ---
const allowedOrigins = [
  "http://localhost:5173", // For your local development frontend
  "https://docathome-rajnandini.netlify.app" // Your live frontend URL
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

// --- Socket.IO Configuration ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  logger.info(`User Connected: ${socket.id}`);
  socket.on('disconnect', () => {
    logger.info(`User Disconnected: ${socket.id}`);
  });
});

app.use(cors(corsOptions));

// --- Security Middleware ---
app.use(helmet()); // Security headers
app.use(generalLimiter); // General rate limiting

app.use(express.json()); // Middleware to parse JSON bodies

// --- API Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/nurses', require('./routes/nurseRoutes'));
app.use('/api/2fa', require('./routes/twoFactorAuthRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/lab-tests', require('./routes/labTestRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/care-circle', require('./routes/careCircle'));
app.use('/api/quests', require('./routes/questRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/prescriptions', require('./routes/PrescriptionRoutes'));

// --- Error Handling ---
// Handle 404 - Route not found (this catches all unmatched routes)
app.use((req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  err.isOperational = true;
  next(err);
});

// Global error handling middleware
app.use(globalErrorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);
    
    // --- Socket.IO Configuration ---
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
      }
    });

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      console.log('New client connected');
      
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
    
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Setup graceful shutdown and error handling
    handleUnhandledRejection(server);
    handleGracefulShutdown(server);
    
    return server;
  } catch (error) {
    logger.error('FATAL ERROR: Could not start server', {
      error: error.message,
      stack: error.stack
    });
    console.error('FATAL ERROR: Could not connect to the database.');
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
