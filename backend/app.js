const path = require("path");
const dotenv = require('dotenv');
if(process.env.NODE_ENV != "production"){
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}







const express = require("express");
const app = express();
const cors = require("cors");



//  Cors Middleware
app.use(cors());
app.use(express.json());

//  Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/nurses', require('./routes/nurseRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/lab-tests', require('./routes/labTestRoutes')); 
app.use('/api/payment', require('./routes/paymentRoutes'));

module.exports = app;