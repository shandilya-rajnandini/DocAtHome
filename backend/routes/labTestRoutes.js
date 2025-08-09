const express = require('express');
const router = express.Router();
const { bookLabTest } = require('../controllers/labTestController');
const { protect } = require('../middleware/authMiddleware');
const { 
  validate, 
  labTestSchemas, 
  limitRequestSize, 
  detectXSS 
} = require('../middleware/validation');

// Apply comprehensive security middleware to all lab test routes
router.use(limitRequestSize);
router.use(detectXSS);

// POST /api/lab-tests - Book a lab test with comprehensive validation
// The route is protected; only logged-in users can book tests.
router.route('/')
    .post(protect, 
          validate(labTestSchemas.create), 
          bookLabTest);

module.exports = router;