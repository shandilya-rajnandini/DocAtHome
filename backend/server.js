const path = require("path");
const dotenv = require('dotenv');


if(process.env.NODE_ENV != "production"){
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}else {
    dotenv.config(); // default .env in production
}

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');


const app = require('./app');  // if app is already created there





// ... your existing routes and middlewares here ...



const server = http.createServer(app);

// --- Production-Ready CORS Configuration ---
const allowedOrigins = [
  "http://localhost:5173", // For your local development frontend
  "https://docathome-rajnandini.netlify.app" // Your live frontend URL

];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};


// Apply CORS middleware to all Express routes before route definitions
app.use(cors(corsOptions));

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


// API Route Definitions
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/nurses', require('./routes/nurseRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

// Mount careCircle routes with distinct prefix to avoid conflict
app.use('/api/careCircle', require('./routes/careCircle'));

app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/lab-tests', require('./routes/labTestRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/quests', require('./routes/questRoutes'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Centralized error handling middleware (must come after routes)
app.use(errorHandler);


// --- Start Server ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try{
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }catch(error){
     console.error("Failed to start server:", error);
    process.exit(1); // Exit if DB connection fails
  }
};

startServer();
