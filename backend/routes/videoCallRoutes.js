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
const { requireRole } = require('../middleware/roleMiddleware');
const { validateObjectId } = require('../middleware/validation');

// Start a new family bridge call
router.post('/start-family-bridge', protect, requireRole(['doctor','nurse']), startFamilyBridgeCall);

// Join an active call
router.post('/:callId/join', protect, validateObjectId('callId'), joinCall);

// End a call
router.post('/:callId/end', protect, validateObjectId('callId'), endCall);

// Get call history for a patient
router.get('/history/:patientId', protect, validateObjectId('patientId'), getCallHistory);

// Get active call for a patient
router.get('/active/:patientId', protect, validateObjectId('patientId'), getActiveCall);

module.exports = router;