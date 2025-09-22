const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// --- THE DEFINITIVE "ALLOW ALL" CORS FIX ---
// This tells the server to accept requests from ANY origin.
// This is the most effective way to solve stubborn CORS issues during development.
app.use(cors());
// --- END OF FIX ---

app.use(express.json());
app.use(helmet());

// API Routes (ensure these files exist and are spelled correctly)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/nurses', require('./routes/nurseRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/lab-tests', require('./routes/labTestRoutes'));

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
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] } // Also make socket.io permissive
});
io.on('connection', (socket) => { console.log(`Socket Connected: ${socket.id}`); });

const PORT = process.env.PORT || 5000;

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