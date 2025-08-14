// const mongoose = require('mongoose');
// require('dotenv').config();

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

module.exports = connectDB;
