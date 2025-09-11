const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
// add other routes here

// Connect DB only in non-test mode
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

module.exports = app; // export Express app for supertest
