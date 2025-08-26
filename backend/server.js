const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

// It's good practice to import your own modules after third-party ones
const { generalLimiter } = require('./middleware/rateLimiter');
const { 
  globalErrorHandler, 
  handleUnhandledRejection, 
  handleUncaughtException, 
  handleGracefulShutdown,
  logger
} = require('./middleware/errorHandler');

// --- Load env vars ---
dotenv.config();

// --- Create Express app ---
const app = express();

// --- Allowlist for CORS ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174', // Often used for previews
  'https://docathome-rajnandini.netlify.app' // Your live frontend URL
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      const error = new Error('Not allowed by CORS');
      error.statusCode = 403;
      callback(error);
    }
  }
};

// --- Security & Middleware Configuration ---
app.use(helmet()); // Sets various security-related HTTP headers
app.use(cors(corsOptions));
app.use(generalLimiter); // Applies basic rate limiting to all requests

// Middleware to parse JSON request bodies
app.use(express.json());

// --- API Route Definitions ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/nurses', require('./routes/nurseRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/lab-tests', require('./routes/labTestRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
// Assuming you have created all these route files:
// app.use('/api/subscription', require('./routes/subscriptionRoutes'));
// app.use('/api/care-circle', require('./routes/careCircleRoutes'));
// app.use('/api/quests', require('./routes/questRoutes'));
// app.use('/api/reviews', require('./routes/reviewRoutes'));
// app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
// app.use('/api/twofactor', require('./routes/twoFactorAuthRoutes'));
// app.use('/api/announcements', require('./routes/announcementRoutes'));
// app.use('/api/ambulance', require('./routes/ambulanceRoutes'));
// app.use('/api/ai', require('./routes/aiRoutes'));
// app.use('/api/availability', require('./routes/availabilityRoutes'));

// --- Health Check Route ---
app.get('/health', (req, res) => res.status(200).send('OK'));

// --- 404 Not Found Handler (must be after all other routes) ---
app.use((req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  next(err);
});

// --- Global Error Handler (must be the last app.use call) ---
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// --- Socket.IO Integration ---
// ... (Socket.IO setup and logic can go here, as in your original file)

// --- Start Server ---
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
    // handleGracefulShutdown(server); // Optional: for graceful shutdowns
  } catch (error) {
    console.error('FATAL ERROR: Could not start server', { error: error.message });
    process.exit(1);
  }
};

// Handle any promise rejections that weren't caught
// handleUnhandledRejection();
// Handle any exceptions that weren't caught
// handleUncaughtException();

startServer();