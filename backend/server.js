const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const socketManager = require('./utils/socketManager');

dotenv.config();
const app = express();

// --- THE DEFINITIVE CORS FIX ---
// This configuration explicitly allows your Netlify domain.
const allowedOrigins = [
    "http://localhost:5173",
    "https://docathome-rajnandini.netlify.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('This origin is not allowed by our CORS policy.'));
        }
    }
}));
// --- END OF FIX ---

app.use(express.json());
app.use(helmet());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
// ... (all your other app.use routes) ...
app.use('/api/lab-tests', require('./routes/labTestRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));


// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

// Error Handlers
app.use((req, res, next) => {
  res.status(404).json({ message: 'API endpoint not found' });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
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

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server is live on port ${PORT}`);
    });
  } catch (error) {
    console.error('FATAL ERROR:', error);
    process.exit(1);
  }
};

startServer();