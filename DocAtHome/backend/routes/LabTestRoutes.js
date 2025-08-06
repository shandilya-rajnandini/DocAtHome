const express = require('express');
const router = express.Router();
const { bookLabTest } = require('../controllers/labTestController');
const { protect } = require('../middleware/authMiddleware');

// The route is protected; only logged-in users can book tests.
router.route('/').post(protect, bookLabTest);

module.exports = router;