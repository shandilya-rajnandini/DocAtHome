// routes/videoCallRoutes.js
const express = require('express');
const router = express.Router();
const {
  startFamilyBridgeCall,
  joinCall,
  endCall,
  getCallHistory,
  getActiveCall
} = require('../controllers/videoCallController');
const { protect } = require('../middleware/authMiddleware');

// Start a new family bridge call
router.post('/start-family-bridge', protect, startFamilyBridgeCall);

// Join an active call
router.post('/:callId/join', protect, joinCall);

// End a call
router.post('/:callId/end', protect, endCall);

// Get call history for a patient
router.get('/history/:patientId', protect, getCallHistory);

// Get active call for a patient
router.get('/active/:patientId', protect, getActiveCall);

module.exports = router;