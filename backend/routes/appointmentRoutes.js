const express = require('express');
const router = express.Router();

// Import all controller functions
const {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  getAppointmentSummary,
  saveVoiceNote,
  scheduleFollowUp,
  updateRelayNote,
  getIntakeFormPDF,
  getTriageQuestion,
  requestReschedule,   // function to request a reschedule
  respondReschedule    // function to approve/deny reschedule
} = require('../controllers/appointmentController');

const { protect } = require('../middleware/authMiddleware');
const {
  validate,
  validateObjectId,
  appointmentSchemas,
  limitRequestSize,
  detectXSS,
} = require('../middleware/validation');

// Apply security middleware to all appointment routes
router.use(limitRequestSize);
router.use(detectXSS);

// ---------------------- Appointment Routes ----------------------

// GET /api/appointments/my-appointments
router.get('/my-appointments', protect, getMyAppointments);

// GET /api/appointments/:id/summary
router.get('/:id/summary', protect, validateObjectId('id'), getAppointmentSummary);

// PUT /api/appointments/:id
router.put(
  '/:id',
  protect,
  validateObjectId('id'),
  validate(appointmentSchemas.updateStatus),
  updateAppointmentStatus
);

// POST /api/appointments/
// Create a new appointment
router.post(
  '/',
  protect,
  validate(appointmentSchemas.create),
  createAppointment
);

// POST /api/appointments/:id/voice-note
router.post('/:id/voice-note', protect, validateObjectId('id'), saveVoiceNote);

// PUT /api/appointments/:id/relay-note
router.put('/:id/relay-note', protect, validateObjectId('id'), updateRelayNote);

// POST /api/appointments/:id/schedule-follow-up
router.post(
  '/:id/schedule-follow-up',
  protect,
  validateObjectId('id'),
  validate(appointmentSchemas.scheduleFollowUp),
  scheduleFollowUp
);

// GET /api/appointments/:id/intake-form
router.get('/:id/intake-form', protect, validateObjectId('id'), getIntakeFormPDF);

// POST /api/triage/question
router.post('/triage/question', protect, getTriageQuestion);

// POST /api/appointments/:id/reschedule
// Doctor or patient can request a reschedule
router.post('/:id/reschedule', protect, validateObjectId('id'), requestReschedule);

// POST /api/appointments/:id/respond-reschedule
// Approve or deny a reschedule request
router.post('/:id/respond-reschedule', protect, validateObjectId('id'), respondReschedule);

module.exports = router;
