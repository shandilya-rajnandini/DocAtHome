const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    console.log('Attempting to connect to database...');
    
    // Check if we're in a testing environment
    const isTest = process.env.NODE_ENV === 'test' || process.argv.includes('--test');
    
    if (isTest) {
      // For demo/test purposes, don't attempt a real connection
      console.log('Running in test mode - using mock database connection');
      
      // Simple way to bypass real MongoDB connection in test mode
      // This creates a fake mongoose-like interface
      return { connection: { host: 'mock-db-server' } };
    }
    
    // For production/development
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
    
  } catch (err) {
    // If there is any error during the connection attempt
    console.error(`Error connecting to MongoDB: ${err.message}`);
    
    // In test mode, don't exit the process
    const isTest = process.env.NODE_ENV === 'test' || process.argv.includes('--test');
    if (!isTest) {
      // Exit the entire Node.js process with a failure code (1)
      process.exit(1);
    } else {
      console.log('Running in test mode - continuing with mock database');
    }
  }
};

// Export the connectDB function
module.exports = connectDB;
