const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/authMiddleware'); // your auth middleware

// Get unread notifications for logged-in user
router.get('/unread', protect, asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id, isRead: false }).sort({ createdAt: -1 });
  res.json({ notifications });
}));

// Mark a notification as read by ID
router.put('/:id/mark-read', protect, asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  notification.isRead = true;
  await notification.save();
  res.json({ message: 'Notification marked as read' });
}));

module.exports = router;
