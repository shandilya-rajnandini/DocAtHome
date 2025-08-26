const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// --- THE DEFINITIVE CORS FIX ---
const allowedOrigins = [
    "http://localhost:5173",
    "https://docathome-rajnandini.netlify.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('This origin is not allowed by CORS'));
        }
    }
}));
// --- END OF FIX ---

app.use(express.json());
app.use(helmet());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/nurses', require('./routes/nurseRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/lab-tests', require('./routes/labTestRoutes'));
// app.use('/api/payment', require('./routes/paymentRoutes')); // Kept commented out for now

// Health Check Route
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
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] }
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