// backend/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  // Prefer error.statusCode / error.status if set, otherwise fall back
  const statusCode = err.statusCode || err.status || 
    (res.statusCode !== 200 ? res.statusCode : 500);

  // If headers are already sent, delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      messages: Object.values(err.errors).map(val => val.message),
    });
  }

  // Handle invalid MongoDB ObjectId errors
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid resource identifier',
      message: err.message,
    });
  }

  // Send generic structured error response
  res.status(statusCode).json({
    success: false,
    error: err.name || 'Error',
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = errorHandler;
