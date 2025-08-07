const express = require('express');
const router = express.Router();
const { getPendingUsers, approveUser } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes here are protected and require admin privileges
router.get('/pending', protect, admin, getPendingUsers);
router.put('/approve/:id', protect, admin, approveUser);

module.exports = router;