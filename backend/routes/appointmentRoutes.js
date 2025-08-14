const express = require('express');
const router = express.Router();

// Import all the necessary controller functions
const {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  getAppointmentSummary,
  saveVoiceNote,
} = require('../controllers/appointmentController');

const { protect } = require('../middleware/authMiddleware');
const { 
  validate, 
  validateObjectId, 
  appointmentSchemas, 
  limitRequestSize, 
  detectXSS 
} = require('../middleware/validation');

// Apply comprehensive security middleware to all appointment routes
router.use(limitRequestSize);
router.use(detectXSS);

// All routes in this file are protected and require a user to be logged in.

// GET /api/appointments/my-appointments
// Fetches all appointments related to the logged-in user (as either patient or professional)
router.route('/my-appointments').get(protect, getMyAppointments);

// GET /api/appointments/:id/summary
// Gets a smart summary for a specific appointment with ID validation
router.route('/:id/summary')
    .get(protect, validateObjectId('id'), getAppointmentSummary);

// PUT /api/appointments/:id
// Updates the status of a specific appointment with comprehensive validation
router.route('/:id')
    .put(protect, 
         validateObjectId('id'), 
         validate(appointmentSchemas.updateStatus), 
         updateAppointmentStatus);

// POST /api/appointments/
// Creates a new appointment with comprehensive input validation
router.route('/')
    .post(protect, 
          validate(appointmentSchemas.create), 
          createAppointment);

//POST /:id/voicenote
//Creates a voice note for the appointment
router.post('/:id/voicenote', protect, saveVoiceNote);

module.exports = router;
