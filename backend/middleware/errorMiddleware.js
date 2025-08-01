// backend/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message;

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400; // Bad Request
    // Extract all validation error messages
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // Handle Mongoose invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400; // Bad Request
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle MongoDB duplicate key error (typically code 11000)
  if (err.code && err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field '${field}': '${err.keyValue[field]}' already exists.`;
  }

  res.status(statusCode);

  res.json({
    success: false,
    error: {
      message,
      // Show stack trace only in development
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
