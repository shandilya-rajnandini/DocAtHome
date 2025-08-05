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
    "http://localhost:5173", // For local development
    "https://docathome-rajnandini.netlify.app" // Your live frontend URL
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});
// --- End of CORS Configuration ---


// --- Socket.IO Connection Logic ---
io.on('connection', (socket) => {
  // ... (your socket logic remains the same)
});

// --- API Route Definitions ---
app.use('/api/auth', require('./routes/authRoutes'));
// ... (all your other app.use routes)
app.use('/api/payment', require('./routes/paymentRoutes'));

const PORT = process.env.PORT || 5000;
//error handling middleware
app.use((req,res,next)=>{
  res.status(404).json({message:'Not found'});
});
//global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// --- Stricter Server Startup ---
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('FATAL ERROR: Could not connect to the database.');
    console.error(error);
    process.exit(1);
  }
};

startServer();