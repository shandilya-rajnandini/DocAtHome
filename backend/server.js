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

// --- Load env vars ---
dotenv.config();

// --- Create Express app ---
const app = express();

// --- Allowlist for CORS ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://docathome-rajnandini.netlify.app'
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
app.use(helmet()); // Security headers
app.use(cors(corsOptions));
app.use(generalLimiter); // General rate limiting

// JSON body parsing with raw body capture for webhook verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// --- Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/nurses', require('./routes/nurseRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/lab-tests', require('./routes/labTestRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));
app.use('/api/care-circle', require('./routes/careCircle'));
app.use('/api/quests', require('./routes/questRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/prescriptions', require('./routes/PrescriptionRoutes'));
app.use('/api/twofactor', require('./routes/twoFactorAuthRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));

// --- Health check ---
app.get('/health', (req, res) => res.status(200).send('OK'));

// handle root URL gracefully
app.get('/', (req, res) => {
  res.send('Welcome to DocAtHome API!');
});

// prevent favicon.ico from hitting error logs
app.get('/favicon.ico', (req, res) => res.status(204).end());

// --- 404 Handler ---
app.use((req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  err.isOperational = true;
  next(err);
});

// --- Global Error Handler ---
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

// --- Start Server ---
const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: { origin: allowedOrigins, methods: ['GET', 'POST'] }
    });

    io.on('connection', (socket) => {
      logger.info(`User Connected: ${socket.id}`);

      socket.on('disconnect', () => logger.info(`User Disconnected: ${socket.id}`));
    });

    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });

    handleUnhandledRejection(server);
    handleGracefulShutdown(server);

  } catch (error) {
    logger.error('FATAL ERROR: Could not start server', { 
      error: error.message, 
      stack: error.stack 
    });
    process.exit(1);
  }
};

// --- Handle uncaught exceptions ---
handleUncaughtException();

startServer();