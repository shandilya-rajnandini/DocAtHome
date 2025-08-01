const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { generateSummary } = require('../utils/aiService');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create a new appointment
// @route   POST /api/appointments
exports.createAppointment = asyncHandler(async (req, res) => {
    // Add the patient's ID from the authenticated user token
    req.body.patient = req.user.id;

    const { doctor } = req.body;

    // Check if the doctor being booked actually exists and has the role of 'doctor'
    const doctorExists = await User.findById(doctor);
    if (!doctorExists || (doctorExists.role !== 'doctor' && doctorExists.role !== 'nurse')) {
        return res.status(404).json({ msg: 'Professional not found' });
    }

    // Create the appointment in the database
    const appointment = await Appointment.create(req.body);

    // Send a success response back to the frontend
    res.status(201).json({
      success: true,
      data: appointment
    });
});


// @desc    Get a smart summary for a specific appointment
// @route   GET /api/appointments/:id/summary
exports.getAppointmentSummary = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id).populate('patient');

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Authorization: Only the assigned doctor can get the summary
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const patient = appointment.patient;

    // Find the last 2 completed appointments for this patient with the same doctor
    const pastAppointments = await Appointment.find({
      patient: patient._id,
      doctor: req.user.id,
      status: 'Completed',
      _id: { $ne: appointment._id },
    })
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(2);

    // Structure the data for the AI service
    const patientDataForAI = {
      name: patient.name,
      currentSymptoms: appointment.symptoms,
      allergies: patient.allergies || [],
      chronicConditions: patient.chronicConditions || [],
      pastVisits: pastAppointments.map(appt => ({
        date: appt.appointmentDate,
        notes: appt.doctorNotes || 'No notes recorded.',
      })),
    };

    // Generate the summary using the AI service
    const summary = await generateSummary(patientDataForAI);

    res.status(200).json({ success: true, summary });
});

// @desc    Get all appointments for the logged-in user (patient or professional)
// @route   GET /api/appointments/my-appointments
exports.getMyAppointments = asyncHandler(async (req, res) => {
        let query;
        // Check the role of the logged-in user to build the correct query
        if (req.user.role === 'doctor' || req.user.role === 'nurse') {
            query = { doctor: req.user.id };
        } else {
            query = { patient: req.user.id };
        }

        const appointments = await Appointment.find(query)
            .populate('doctor', 'name specialty')
            .populate('patient', 'name allergies chronicConditions'); // Populate patient details for the doctor's view

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
});

// @desc    Update an appointment's status (e.g., confirm or cancel)
// @route   PUT /api/appointments/:id
exports.updateAppointmentStatus = asyncHandler(async (req, res) => {

    const { status, doctorNotes } = req.body;

    // Find the appointment by its ID
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Authorization Check: Ensure the logged-in user is the professional assigned to this appointment
    if (appointment.doctor.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized to update this appointment' });
    }

    // Update the status
    appointment.status = status;

    // If doctorNotes is provided in the request, update the appointment
    // This handles both new notes and clearing existing notes with an empty string
    if (doctorNotes !== undefined) {
      appointment.doctorNotes = doctorNotes;
    }

    await appointment.save();

    res.json(appointment);
});
