const express = require('express');
const router = express.Router();

// Import controller functions
const {
  createDischargeConcierge,
  getDischargeConciergeBookings,
  getDischargeConcierge,
  updateDischargeConciergeStatus,
  updateAssessmentResults,
  addFollowUp,
  completeFollowUp,
  cancelDischargeConcierge
} = require('../controllers/dischargeConciergeController');

const { protect } = require('../middleware/authMiddleware');
const {
  validate,
  validateObjectId,
  limitRequestSize,
  detectXSS,
} = require('../middleware/validation');

// Apply security middleware
router.use(limitRequestSize);
router.use(detectXSS);

// Validation schemas for discharge concierge
const dischargeConciergeSchemas = {
  create: {
    nurse: { type: 'string', required: true, pattern: /^[0-9a-fA-F]{24}$/ },
    hospitalName: { type: 'string', required: true, minLength: 2, maxLength: 100 },
    hospitalAddress: { type: 'string', required: true, minLength: 10, maxLength: 200 },
    dischargeDate: { type: 'string', required: true, pattern: /^\d{4}-\d{2}-\d{2}$/ },
    pickupTime: { type: 'string', required: true, pattern: /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/ },
    patientAddress: { type: 'string', required: true, minLength: 10, maxLength: 200 },
    'emergencyContact.name': { type: 'string', required: true, minLength: 2, maxLength: 50 },
    'emergencyContact.phone': { type: 'string', required: true, pattern: /^\+?[\d\s\-\(\)]+$/ },
    'emergencyContact.relationship': { type: 'string', required: true, minLength: 2, maxLength: 30 },
    'medicalDetails.dischargeDiagnosis': { type: 'string', required: true, minLength: 5, maxLength: 200 },
    'medicalDetails.currentMedications': { type: 'string', required: true, minLength: 5, maxLength: 500 },
    paymentMethod: { type: 'string', enum: ['Credit Card', 'Insurance', 'Cash', 'careFund'] }
  },
  updateStatus: {
    status: {
      type: 'string',
      required: true,
      enum: ['Requested', 'Assigned', 'Hospital Pickup', 'In Transit', 'Home Assessment', 'Completed', 'Cancelled']
    },
    notes: { type: 'string', maxLength: 500 }
  },
  assessment: {
    'assessmentResults.homeSafetyScore': { type: 'number', min: 1, max: 10 },
    'assessmentResults.medicationConcerns': { type: 'string', maxLength: 500 },
    'assessmentResults.vitalSigns.bloodPressure': { type: 'string', maxLength: 20 },
    'assessmentResults.vitalSigns.heartRate': { type: 'string', maxLength: 20 },
    'assessmentResults.vitalSigns.temperature': { type: 'string', maxLength: 20 },
    'assessmentResults.vitalSigns.oxygenSaturation': { type: 'string', maxLength: 20 },
    'assessmentResults.recommendations': { type: 'string', maxLength: 1000 }
  },
  followUp: {
    scheduledDate: { type: 'string', required: true, pattern: /^\d{4}-\d{2}-\d{2}$/ },
    scheduledTime: { type: 'string', required: true, pattern: /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/ },
    notes: { type: 'string', maxLength: 500 }
  }
};

// All routes require authentication
router.use(protect);

// GET /api/discharge-concierge
// Get all discharge concierge bookings for the logged-in user
router.route('/')
  .get(getDischargeConciergeBookings)
  .post(validate(dischargeConciergeSchemas.create), createDischargeConcierge);

// GET /api/discharge-concierge/:id
// Get a specific discharge concierge booking
router.route('/:id')
  .get(validateObjectId('id'), getDischargeConcierge);

// PUT /api/discharge-concierge/:id/status
// Update booking status (nurse only)
router.route('/:id/status')
  .put(validateObjectId('id'), validate(dischargeConciergeSchemas.updateStatus), updateDischargeConciergeStatus);

// PUT /api/discharge-concierge/:id/assessment
// Update assessment results (nurse only)
router.route('/:id/assessment')
  .put(validateObjectId('id'), validate(dischargeConciergeSchemas.assessment), updateAssessmentResults);

// POST /api/discharge-concierge/:id/followup
// Add a follow-up entry (nurse only)
router.route('/:id/followup')
  .post(validateObjectId('id'), validate(dischargeConciergeSchemas.followUp), addFollowUp);

// PUT /api/discharge-concierge/:id/followup/:followupId
// Mark follow-up as completed (nurse only)
router.route('/:id/followup/:followupId')
  .put(validateObjectId('id'), validateObjectId('followupId'), completeFollowUp);

// PUT /api/discharge-concierge/:id/cancel
// Cancel a discharge concierge booking
router.route('/:id/cancel')
  .put(validateObjectId('id'), cancelDischargeConcierge);

module.exports = router;