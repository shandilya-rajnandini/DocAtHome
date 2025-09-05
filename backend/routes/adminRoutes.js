const express = require('express');
const router = express.Router();
const { getPendingUsers, approveUser, getIntakeFormLogs } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes here are protected and require admin privileges
router.get('/pending', protect, admin, getPendingUsers);
router.put('/approve/:id', protect, admin, approveUser);
router.get('/intake-form-logs', protect, admin, getIntakeFormLogs);
router.get('/intake-form-logs/export', protect, admin, require('../controllers/adminController').exportIntakeFormLogs);

module.exports = router;