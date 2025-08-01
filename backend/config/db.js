const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');

// This is an asynchronous function because connecting to a database is an async operation.
const connectDB = asyncHandler(async () => {
    // Attempt to connect to MongoDB using the URI from our .env file.
    // The mongoose.connect() method returns a promise, so we use 'await'.
   await mongoose.connect(process.env.MONGO_URI);
    
});

// Export the connectDB function so it can be used in other files (like server.js).
module.exports = connectDB;