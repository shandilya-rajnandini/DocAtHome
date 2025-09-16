// routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const {
  getSupportGroups,
  getSupportGroup,
  createSupportGroup,
  joinSupportGroup,
  leaveSupportGroup,
  getGroupMessages,
  postMessage,
  toggleMessageLike,
  moderateMessage,
  getUserMemberships
} = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

// Public routes (no auth required)
router.get('/groups', getSupportGroups);

// Protected routes
router.use(protect);

// Group management
router.get('/groups/:id', getSupportGroup);
router.post('/groups', createSupportGroup); // Nurse only
router.post('/groups/:id/join', joinSupportGroup);
router.post('/groups/:id/leave', leaveSupportGroup);

// Messages
router.get('/groups/:id/messages', getGroupMessages);
router.post('/groups/:id/messages', postMessage);
router.post('/groups/:id/messages/:messageId/like', toggleMessageLike);

// Moderation (nurse only)
router.post('/groups/:id/messages/:messageId/moderate', moderateMessage);

// User memberships
router.get('/memberships', getUserMemberships);

module.exports = router;