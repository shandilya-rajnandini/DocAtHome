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

// --- THE DEFINITIVE PRODUCTION CORS FIX ---
// This tells the server to ONLY accept requests from your Netlify frontend.
// It is the most secure and reliable way to handle CORS on a live site.
const allowedOrigins = [
<<<<<<< HEAD
  'https://docathome-rajnandini.netlify.app',
  'https://docathome-backend.onrender.com'
=======
    'http://localhost:5173',
    'https://docathome-rajnandini.netlify.app'
>>>>>>> 279064eb69d607fc5c0a9b13c6d4667ce0f16791
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // Allow the origin if it is in our allowed list
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
// --- END OF FIX ---

app.use(express.json());
app.use(helmet());

<<<<<<< HEAD
// API Routes (ensure these files exist and are spelled correctly)
=======
// Secure uploads access (auth required; add resource-level ACLs in controller)
app.get('/uploads/:bucket/:file', protect, async (req, res) => {
  const { bucket, file } = req.params;
  const allow = new Set(['second-opinions', 'video-responses']); // tighten as needed
  if (!allow.has(bucket)) return res.status(404).end();
  // TODO: enforce per-file authorization (e.g., patient is owner, specialist assigned)
  res.sendFile(path.join(process.cwd(), 'uploads', bucket, file));
});

// API Routes
>>>>>>> 279064eb69d607fc5c0a9b13c6d4667ce0f16791
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/nurses', require('./routes/nurseRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/lab-tests', require('./routes/labTestRoutes'));

app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/video-calls', require('./routes/videoCallRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/second-opinions', require('./routes/secondOpinionRoutes'));
app.use('/api/discharge-concierge', require('./routes/dischargeConciergeRoutes'));
app.use('/api/demand-insights', require('./routes/demandInsightsRoutes'));

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
<<<<<<< HEAD
const io = new Server(server, {
  cors: { 
    origin: "https://docathome-rajnandini.netlify.app", 
    methods: ["GET", "POST"],
    credentials: true 
  }
});
io.on('connection', (socket) => { console.log(`Socket Connected: ${socket.id}`); });
=======


// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
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
>>>>>>> 279064eb69d607fc5c0a9b13c6d4667ce0f16791

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    startScheduler(); // Start the adherence scheduler
    server.listen(PORT, () => {
      console.log(`Server is live on port ${PORT}`);
    });
  } catch (error) {
    console.error('FATAL ERROR:', error);
    process.exit(1);
  }
};

startServer();