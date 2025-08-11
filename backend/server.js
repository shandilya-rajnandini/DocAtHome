const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);

// --- Production-Ready CORS Configuration ---
const allowedOrigins = [
    "http://localhost:5173",
    "https://docathome-rajnandini.netlify.app"
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// ... (your Socket.IO config)

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