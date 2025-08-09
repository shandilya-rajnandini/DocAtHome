const express = require("express");
const router = express.Router();

// Import all the necessary controller functions
const {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  getAppointmentSummary,
  saveVoiceNote,
} = require("../controllers/appointmentController");

const { protect } = require("../middleware/authMiddleware");

// All routes in this file are protected and require a user to be logged in.

// GET /api/appointments/my-appointments
// Fetches all appointments related to the logged-in user (as either patient or professional)
router.route("/my-appointments").get(protect, getMyAppointments);

// GET /api/appointments/:id/summary
// Gets a smart summary for a specific appointment
router.route("/:id/summary").get(protect, getAppointmentSummary);

// PUT /api/appointments/:id
// Updates the status of a specific appointment (e.g., to 'Confirmed' or 'Cancelled')
router.route("/:id").put(protect, updateAppointmentStatus);

// POST /api/appointments/
// Creates a new appointment
router.route("/").post(protect, createAppointment);

//POST /:id/voicenote
//Creates a voice note for the appointment
router.post("/:id/voicenote", protect, saveVoiceNote);

module.exports = router;
