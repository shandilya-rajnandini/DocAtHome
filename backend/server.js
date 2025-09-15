const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

const path = require('path');

// --- THE DEFINITIVE CORS FIX ---
// This configuration explicitly allows your Netlify domain.
const allowedOrigins = [
    "http://localhost:5173",
    "https://docathome-rajnandini.netlify.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('This origin is not allowed by our CORS policy.'));
        }
    }
}));
// --- END OF FIX ---

app.use(express.json());
app.use(helmet());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
// ... (all your other app.use routes) ...
app.use('/api/lab-tests', require('./routes/labTestRoutes'));

// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

// Error Handlers - use centralized global error handler
const { globalErrorHandler } = require('./middleware/errorHandler');
app.use((req, res, next) => {
  res.status(404).json({ message: 'API endpoint not found' });
});
app.use(globalErrorHandler);

const server = http.createServer(app);
// ... (Socket.IO setup) ...

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

// Export the app for testing (supertest will use this). Start the server only when run directly.
module.exports = app;

if (require.main === module) {
  startServer();
}