const express = require('express');
const router = express.Router();
const { getAvailability, updateAvailability } = require('../controllers/availabilityController');
const { protect } = require('../middleware/authMiddleware');

// Get professional's availability
router.get('/:id', protect, getAvailability);

// Update professional's availability
router.post('/:id', protect, updateAvailability);

module.exports = router;