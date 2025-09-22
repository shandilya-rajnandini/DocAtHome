const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// --- THE DEFINITIVE PRODUCTION CORS FIX ---
// This tells the server to ONLY accept requests from your Netlify frontend.
// It is the most secure and reliable way to handle CORS on a live site.
const allowedOrigins = [
  'https://docathome-rajnandini.netlify.app',
  'https://docathome-backend.onrender.com'
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
  cors: { 
    origin: "https://docathome-rajnandini.netlify.app", 
    methods: ["GET", "POST"],
    credentials: true 
  }
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