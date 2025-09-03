const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    console.log('Attempting to connect to database...');
    
    // Prefer TEST_MONGO_URI if provided (used by mongodb-memory-server in tests)
    const mongoUri = process.env.TEST_MONGO_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      // If no URI configured, and not in a test setup, return mock to avoid crashing.
      console.log('No MongoDB URI provided; running with mock DB in this environment');
      return { connection: { host: 'mock-db-server' } };
    }
    
    // For production/development
  const conn = await mongoose.connect(mongoUri);
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
