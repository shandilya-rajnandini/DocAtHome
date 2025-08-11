const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
app.use('/api/lab-tests', require('./routes/labTestRoutes'));

dotenv.config();

const app = express();

// Create Express app and HTTP server
const app = require('./app');

const server = http.createServer(app);

// --- Production-Ready CORS Configuration ---
const allowedOrigins = [
    "http://localhost:5173",
    "https://docathome-rajnandini.netlify.app"
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
S
// ... (your Socket.IO config)

D
// --- Fly.io Health Check Route ---
// This is a special route that Fly.io will use to check if your server is alive.
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// --- API Route Definitions ---
app.use('/api/auth', require('./routes/authRoutes'));
// ... (all your other app.use routes)
app.use('/api/payment', require('./routes/paymentRoutes'));

// ... (your error handling middleware)

// --- Socket.IO Configuration ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

// --- Error Handling ---
app.use((req, res, next) => {
  res.status(404).json({ message: 'API endpoint not found' });
})

// --- Server Startup for Fly.io ---
// Fly.io sets the PORT environment variable. It expects to connect to 0.0.0.0.
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('FATAL ERROR: Could not connect to the database.');
    console.error(error);
    process.exit(1);
  }
};

startServer();