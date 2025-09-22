// routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/roleMiddleware');
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
const { requireRole } = require('../middleware/roleMiddleware');

// Public routes (no auth required)
router.get('/groups', getSupportGroups);

// Protected routes
router.use(protect);

// Group management
router.get('/groups/:id', getSupportGroup);
router.post('/groups/:id/join', joinSupportGroup);
router.post('/groups/:id/leave', leaveSupportGroup);

// Messages
router.get('/groups/:id/messages', getGroupMessages);
router.post('/groups/:id/messages', postMessage);
router.post('/groups/:id/messages/:messageId/like', toggleMessageLike);

// User memberships
router.get('/memberships', getUserMemberships);

// Admin routes (nurse only)
router.use('/admin', requireRole(['nurse']));
router.post('/admin/groups', createSupportGroup);
router.put('/admin/groups/:id/messages/:messageId/moderate', moderateMessage);

module.exports = router;