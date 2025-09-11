// /backend/app.js for backend-ci.yml test
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
app.use(express.json());

// register routes
app.use('/api/auth', require('./routes/auth')); 
// TODO: add other routes as needed, same as in server.js

// prevent DB connect when running in test mode
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

module.exports = app;
