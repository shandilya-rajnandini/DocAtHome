// app.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
app.use(express.json());

// Use the correct route file
app.use('/api/auth', require('./routes/authRoutes'));

// Add other routes here (same as server.js)

// Connect DB only in non-test mode
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

module.exports = app;
