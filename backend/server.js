const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const app = require('./app');

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