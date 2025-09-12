const http = require('http');
const app = require('./app'); // import app.js instead of creating app here
const connectDB = require('./config/db');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// --- Socket.IO setup (optional) ---
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://docathome-rajnandini.netlify.app"
    ],
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('⚡ Socket connected:', socket.id);
  // ... add your socket event handlers here
});

const startServer = async () => {
  try {
    await connectDB(); // connect to DB
    server.listen(PORT, () => {
      console.log(`Server is live on port ${PORT}`);
    });
  } catch (error) {
    console.error('FATAL ERROR:', error);
    process.exit(1);
  }
};

startServer();

module.exports = server; // export server if needed (optional for advanced use)
