const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Create a new appointment
// @route   POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
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
  } catch (err) {
    console.error('APPOINTMENT CREATION ERROR:', err.message);
    res.status(500).send('Server Error');
  }
};


// @desc    Get appointments for the logged-in user (as patient)
// @route   GET /api/appointments/my-appointments
exports.getMyAppointments = async (req, res) => {
    try {
        // Find appointments where the 'patient' field matches the logged-in user's ID
        const appointments = await Appointment.find({ patient: req.user.id })
        .populate('doctor', 'name specialty') // Get doctor's name and specialty
        .populate('patient', 'name') // Get patient's name
        .sort({ appointmentDate: -1 }); // Sort by most recent first

        res.json(appointments);
    } catch (err) {
        console.error('GET MY APPOINTMENTS ERROR:', err.message);
        res.status(500).send('Server Error');
    }
};

// ... (keep the existing createAppointment and getMyAppointments functions)

// --- ADD THIS NEW FUNCTION ---
// @desc    Get appointments for the logged-in doctor
// @route   GET /api/appointments/doctor
exports.getDoctorAppointments = async (req, res) => {
    try {
        // Find appointments where the 'doctor' field matches the logged-in user's ID
        const appointments = await Appointment.find({ doctor: req.user.id })
        .populate('patient', 'name email') // Get patient's name and email
        .sort({ appointmentDate: -1 }); // Sort by most recent first

        res.json(appointments);
    } catch (err) {
        console.error('GET DOCTOR APPOINTMENTS ERROR:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update an appointment's status (e.g., confirm or cancel)
// @route   PUT /api/appointments/:id
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body; // Expecting { status: 'Confirmed' } or { status: 'Cancelled' }

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
    await appointment.save();

    res.json(appointment);

  } catch (err) {
    console.error('UPDATE APPOINTMENT ERROR:', err.message);
    res.status(500).send('Server Error');
  }
};
