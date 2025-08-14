const express = require('express');
const router = express.Router();
const refillRequestController = require('./controllers/refillRequestController');
const auth = require('../middleware/auth'); // Make sure this checks authentication

// Patient: Create a refill request
router.post('/', auth, refillRequestController.createRefillRequest);

// Doctor: Get all refill requests for their patients
router.get('/doctor', auth, refillRequestController.getRefillRequestsForDoctor);

// Doctor: Approve a refill request
router.post('/:id/approve', auth, refillRequestController.approveRefillRequest);

// Doctor: Deny a refill request
router.post('/:id/deny', auth, refillRequestController.denyRefillRequest);

module.exports = router;
