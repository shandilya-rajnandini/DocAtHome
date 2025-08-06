const mongoose = require('mongoose');

// This is an asynchronous function because connecting to a database is an async operation.
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI from our .env file.
    // The mongoose.connect() method returns a promise, so we use 'await'.
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If the connection is successful, log a confirmation message to the console.
    // We can access the host of the connected database from the connection object.
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
  } catch (err) {
    // If there is any error during the connection attempt (e.g., wrong password, IP not whitelisted),
    // this 'catch' block will run.
    
    // Log the specific error message to the console for debugging.
    console.error(`Error connecting to MongoDB: ${err.message}`);
    
    // Exit the entire Node.js process with a failure code (1).
    // This is important because the application cannot run without a database connection.
    process.exit(1);
  }
};

// Export the connectDB function so it can be used in other files (like server.js).
module.exports = connectDB;