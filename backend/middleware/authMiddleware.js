const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.user.id).select('-password');

      // Update lastActive timestamp (only if more than 5 minutes have passed)
      if (req.user) {
        const now = new Date();
        const lastActive = req.user.lastActive ? new Date(req.user.lastActive) : new Date(0);
        const timeDiff = now - lastActive;
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

        if (timeDiff > fiveMinutes) {
          // Update lastActive asynchronously (don't await to avoid blocking the request)
          User.findByIdAndUpdate(req.user.id, { lastActive: now }).exec();
        }
      }

      next();
    } catch (_error) {
      res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ msg: 'Not authorized as an admin' });
  }
};