const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');
const socketManager = require('./utils/socketManager');
const { startScheduler } = require('./utils/adherenceScheduler');
const { protect } = require('./middleware/authMiddleware');

dotenv.config();
const app = express();

// --- COMPREHENSIVE CORS CONFIGURATION ---
// This configuration allows requests from all your frontend deployments and local development
const allowedOrigins = [
  // Local development
  'http://localhost:3000',
  'http://localhost:5173', // Vite default port
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',

  // Production deployments
  'https://docathome-rajnandini.netlify.app',
  'https://docathome-backend.onrender.com',

  // Add any other domains you might deploy to
  'https://docathome.netlify.app',
  'https://docathome.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, curl requests)
      if (!origin) return callback(null, true);

      // Allow the origin if it is in our allowed list
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      // For development, be more permissive with localhost
      if (
        process.env.NODE_ENV === 'development' &&
        origin &&
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }

      // Log the rejected origin for debugging
      console.log('CORS blocked origin:', origin);
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 86400, // 24 hours
  })
);
// --- END OF CORS CONFIGURATION ---

app.use(express.json());
app.use(helmet());

// Secure uploads access (auth required; add resource-level ACLs in controller)
app.get('/uploads/:bucket/:file', protect, async (req, res) => {
  const { bucket, file } = req.params;
  const allow = new Set(['second-opinions', 'video-responses']); // tighten as needed
  if (!allow.has(bucket)) return res.status(404).end();
  // TODO: enforce per-file authorization (e.g., patient is owner, specialist assigned)
  res.sendFile(path.join(process.cwd(), 'uploads', bucket, file));
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/availability', require('./routes/availabilityRoutes'));
app.use('/api/care-circle', require('./routes/careCircle'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/lab-tests', require('./routes/labTestRoutes'));
app.use('/api/nurses', require('./routes/nurseRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/prescriptions', require('./routes/PrescriptionRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/quests', require('./routes/questRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/second-opinions', require('./routes/secondOpinionRoutes'));
app.use('/api/discharge-concierge', require('./routes/dischargeConciergeRoutes'));
app.use('/api/video-calls', require('./routes/videoCallRoutes'));
app.use('/api/two-factor-auth', require('./routes/twoFactorAuthRoutes'));
app.use('/api/demand-insights', require('./routes/demandInsightsRoutes'));
app.use('/api/forum', require('./routes/forumRoutes'));

// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

// Error Handlers
app.use((req, res, _next) => {
  res.status(404).json({ message: 'API endpoint not found' });
});
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin) return callback(null, true);

      // Allow the origin if it is in our allowed list
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      // For development, be more permissive with localhost
      if (
        process.env.NODE_ENV === 'development' &&
        origin &&
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

// Initialize socketManager with io instance
socketManager.initialize(io);

// Handle client connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Listen for client joining their personal room after authentication
  socket.on('join_user_room', (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    startScheduler(); // Start the adherence scheduler
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is live on port ${PORT}`);
    });
  } catch (error) {
    console.error('FATAL ERROR:', error);
    process.exit(1);
  }
};

startServer();
