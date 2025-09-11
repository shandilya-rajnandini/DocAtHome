const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
// Add other routes as needed

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

module.exports = app; // Export app for supertest
