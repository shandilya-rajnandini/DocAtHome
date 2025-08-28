// const mongoose = require('mongoose');
// require('dotenv').config();

<<<<<<< HEAD
// const connectDB = async () => {
//   try {
    
//     const conn = await mongoose.connect(process.env.MONGO_URI);

  
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
    
//   } catch (err) {
//     // If there is any error during the connection attempt (e.g., wrong password, IP not whitelisted),
//     // this 'catch' block will run.
    
//     // Log the specific error message to the console for debugging.
//     console.error(`Error connecting to MongoDB: ${err.message}`);
    
//     // Exit the entire Node.js process with a failure code (1).
//     // This is important because the application cannot run without a database connection.
//     process.exit(1);
//   }
// };

// // Export the connectDB function so it can be used in other files (like server.js).
// module.exports = connectDB;


const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in .env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

=======
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
>>>>>>> 3034ca107665e7f228b98040e7887ea64351cabc
module.exports = connectDB;
