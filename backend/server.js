
const path = require("path");
const dotenv = require('dotenv');
if(process.env.NODE_ENV != "production"){
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}


const http = require('http');
const { Server } = require('socket.io');
const errorHandler = require('./middleware/errorMiddleware');

// ... your existing routes and middlewares here ...


const connectDB = require('./config/db');
const app = require('./app');  // if app is already created there




const server = http.createServer(app);

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

// Mount careCircle routes with distinct prefix to avoid conflict
app.use('/api/careCircle', require('./routes/careCircle'));

app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/lab-tests', require('./routes/labTestRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/quests', require('./routes/questRoutes'));

// Centralized error handling middleware (must come after routes)
app.use(errorHandler);

// Server Port
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
