const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const { 
  globalErrorHandler, 
  handleUnhandledRejection, 
  handleUncaughtException, 
  handleGracefulShutdown,
  logger 
} = require('./middleware/errorHandler');

// Handle uncaught exceptions first
handleUncaughtException();

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

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

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ success: true, message: 'Error boundary test successful!' });
});

// --- Error Handling ---
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  err.isOperational = true;
  next(err);
});

app.use(globalErrorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const server = http.createServer(app);
    
    server.listen(PORT, () => {
      logger.info(`🧪 Test server running on port ${PORT}`);
      console.log(`🧪 Test server running on port ${PORT}`);
      console.log('✅ Error boundary protection test successful!');
    });

    handleUnhandledRejection(server);
    handleGracefulShutdown(server);
    
    return server;
  } catch (error) {
    logger.error('FATAL ERROR: Could not start server', {
      error: error.message,
      stack: error.stack
    });
    console.error('FATAL ERROR: Could not start test server.');
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
