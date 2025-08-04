const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const app = require('./app');
const prescriptionRoutes = require('./routes/PrescriptionRoutes'); // adjust path


// Load environment variables from .env file
const dotenv = require('dotenv');
dotenv.config();

// const app = express();


const server = http.createServer(app);
const careCircle = require("./routes/careCircle");

// Configure Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Socket.IO Connection Logic
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);
  socket.on('join_room', (data) => socket.join(data));
  socket.on('send_message', (data) => socket.to(data.room).emit('receive_message', data));
  socket.on('disconnect', () => console.log('User Disconnected', socket.id));
});

// API Route Definitions
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/nurses', require('./routes/nurseRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/lab-tests', require('./routes/labTestRoutes')); // <-- New Lab Test Route
app.use('/api/payment', require('./routes/paymentRoutes'));

app.use("/api/profile", require("./routes/careCircle"));

app.use('/api/quests', require('./routes/questRoutes'));
app.use('/api/prescriptions', prescriptionRoutes); // <-- Prescription Routes


// Server Port
const PORT = process.env.PORT || 5000;

// Strict Server Startup Function
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running with chat on port ${PORT}`);
    });
  } catch (error) {
    console.error('FATAL ERROR: Could not connect to the database.', error);
    process.exit(1);
  }
};

startServer();
