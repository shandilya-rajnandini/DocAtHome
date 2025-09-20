
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const FollowUp = require('../models/FollowUp');
const { generateSummary } = require('../utils/aiService');
const asyncHandler = require('../middleware/asyncHandler');
const PDFDocument = require('pdfkit');


// @desc    Create a new appointment
// @route   POST /api/appointments

exports.createAppointment = asyncHandler(async (req, res) => {
  // Add the patient's ID from the authenticated user token
  req.body.patient = req.user.id;

  const { doctor, fee, paymentMethod = 'external', shareRelayNote } = req.body;
  const shareRelayNoteBool = !!shareRelayNote;
  console.log('Received shareRelayNote:', shareRelayNote);
  console.log('Received shareRelayNote:', shareRelayNoteBool);
  // Check if the doctor being booked actually exists and has the role of 'doctor'
  const doctorExists = await User.findById(doctor);
  if (
    !doctorExists ||
    (doctorExists.role !== 'doctor' && doctorExists.role !== 'nurse')
  ) {
    return res.status(404).json({ msg: 'Professional not found' });
  }

  // If patient wants to pay from care fund, check balance and deduct
  if (paymentMethod === 'careFund') {
    const patient = await User.findById(req.user.id);

    if (!patient) {
      return res.status(404).json({ msg: 'Patient not found' });
    }

    if (patient.careFundBalance < fee) {
      return res.status(400).json({
        msg: `Insufficient care fund balance. Available: ₹${patient.careFundBalance}, Required: ₹${fee}`,
      });
    }

    // Deduct the fee from care fund balance
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { careFundBalance: -fee },
    });

    // Create a transaction record for care fund payment
    const Transaction = require('../models/Transaction');
    await Transaction.create({
      userId: req.user.id,
      razorpayOrderId: `care_fund_${Date.now()}`,
      razorpayPaymentId: `care_fund_payment_${Date.now()}`,
      amount: fee,
      currency: 'INR',
      description: `Care Fund Payment for appointment with ${doctorExists.name}`,
      status: 'paid',
    });
  }
  // relay note stuff
  let sharedRelayNotes = [];
  if (shareRelayNote) {
    const prevAppointments = await Appointment.find({
      patient: req.user.id,
      status: 'Completed',
      relayNote: { $exists: true, $ne: '' },
    })
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .populate('doctor', 'name specialty');

    sharedRelayNotes = prevAppointments.map((appt) => ({
      note: appt.relayNote,
      doctorName: appt.doctor?.name || '',
      doctorDesignation: appt.doctor?.specialty || '',
    }));
  }
  // --- Acuity Scoring Logic ---
  let acuityScore = 1; // default
  const symptomsText = (req.body.symptoms || "").toLowerCase();

  if (
    symptomsText.includes("chest pain") ||
    symptomsText.includes("difficulty breathing") ||
    symptomsText.includes("severe")
  ) {
    acuityScore = 5;
  } else if (
    symptomsText.includes("fever") ||
    symptomsText.includes("cough") ||
    symptomsText.includes("pain")
  ) {
    acuityScore = 2;
  } else if (
    symptomsText.includes("follow-up") ||
    symptomsText.includes("routine check")
  ) {
    acuityScore = 1;
  }

  // Create the appointment in the database
  console.log('shared relay notes found:', sharedRelayNotes);
  const appointment = await Appointment.create({
    ...req.body,
    paymentMethod: paymentMethod || 'external',
    sharedRelayNotes, // <-- array of previous notes
    shareRelayNote: shareRelayNoteBool, // <-- always boolean
    acuityScore,
  });

  // Send a success response back to the frontend
  res.status(201).json({
    success: true,
    data: appointment,
    message:
      paymentMethod === 'careFund'
        ? `Appointment booked successfully! ₹${fee} deducted from your care fund.`
        : 'Appointment booked successfully!',
  });
});

// @desc    Get a smart summary for a specific appointment
// @route   GET /api/appointments/:id/summary
exports.getAppointmentSummary = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate(
    'patient'
  );

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
    pastVisits: pastAppointments.map((appt) => ({
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

  // Check the role of the logged-in user to build the correct query
  if (req.user.role === "doctor" || req.user.role === "nurse") {
    query = { doctor: req.user.id };
  } else {
    query = { patient: req.user.id };
  }

  const appointments = await Appointment.find(query)
    .populate("doctor", "name specialty")
    .populate("patient", "name allergies chronicConditions");

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments,
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

  // Authorization Check:
  // - For doctors/nurses: they can update any appointment assigned to them
  // - For patients: they can only cancel their own appointments
  if (
    status === 'Cancelled' &&
    appointment.patient.toString() === req.user.id
  ) {
    // Patient canceling their own appointment

    // Check cancellation policy: no cancellations within 2 hours of the appointment
    const appointmentDateStr = appointment.appointmentDate; // e.g., "2025-07-02"
    const appointmentTimeStr = appointment.appointmentTime; // e.g., "01:00 PM"

    // Convert 12-hour format to 24-hour format for proper parsing
    const [time, period] = appointmentTimeStr.split(' ');
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);

    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    const appointmentDateTime = new Date(appointmentDateStr);
    appointmentDateTime.setHours(hour24, parseInt(minutes), 0, 0);

    const now = new Date();
    const timeDifference = appointmentDateTime.getTime() - now.getTime();
    const hoursUntilAppointment = timeDifference / (1000 * 60 * 60);

    if (hoursUntilAppointment < 2) {
      return res.status(400).json({
        msg: 'Cannot cancel appointment within 2 hours of the scheduled time',
      });
    }

    // Check if appointment is in a cancellable state
    if (!['Pending', 'Confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        msg: 'This appointment cannot be cancelled',
      });
    }

    // If the appointment was paid using care fund, refund the amount
    // Note: appointment.fee is stored in paise, so careFundBalance increment is consistent
    if (appointment.paymentMethod === "careFund") {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { careFundBalance: appointment.fee }, // fee is in paise
      });

      // Create a transaction record for the refund
      const Transaction = require("../models/Transaction");
      await Transaction.create({
        userId: req.user.id,
        razorpayOrderId: `refund_${Date.now()}`,
        razorpayPaymentId: `refund_payment_${Date.now()}`,
        amount: appointment.fee, // fee is in paise
        currency: "INR",
        description: `Care Fund Refund for cancelled appointment`,
        status: "refunded",
      });
    }
  } else if (appointment.doctor.toString() !== req.user.id) {
    // For all other status updates, only the assigned doctor/nurse can update
    return res
      .status(401)
      .json({ msg: "User not authorized to update this appointment" });
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

// @desc    Create a voice note
// @route   POST /:id/voice-note

exports.saveVoiceNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { voiceUrl } = req.body; // expects { voiceUrl: "https://..." }

  if (!voiceUrl) {
    return res
      .status(400)
      .json({ success: false, message: 'Voice URL is required.' });
  }

  const appointment = await Appointment.findByIdAndUpdate(
    id,
    { voiceRecording: voiceUrl },
    { new: true }
  );

  if (!appointment) {
    return res
      .status(404)
      .json({ success: false, message: 'Appointment not found.' });
  }

  res.json({ success: true, data: appointment });
});

// @desc    Create relay note
// @route   PUT /:id/relay-note
exports.updateRelayNote = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { relayNote: req.body.relayNote },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
const sendEmail = require("../utils/sendEmail");

// @desc    Schedule a follow-up for an appointment
// @route   POST /api/appointments/:id/schedule-follow-up
exports.scheduleFollowUp = asyncHandler(async (req, res) => {
  const { followUpDate, note } = req.body;
  const appointmentId = req.params.id;

  const appointment = await Appointment.findById(appointmentId).populate(
    "patient doctor"
  );

  if (!appointment) {
    return res.status(404).json({ msg: "Appointment not found" });
  }

  // Authorization: Only the assigned doctor can schedule a follow-up
  if (
    req.user.role !== "doctor" ||
    appointment.doctor._id.toString() !== req.user.id
  ) {
    return res.status(401).json({ msg: "User not authorized" });
  }

  if (appointment.status !== "Completed") {
    return res
      .status(400)
      .json({
        msg: "Follow-up can only be scheduled for completed appointments",
      });
  }

  const followUp = await FollowUp.create({
    patient: appointment.patient,
    doctor: appointment.doctor,
    appointment: appointmentId,
    followUpDate,
    note,
  });

  // Send email notification immediately
  const { patient, doctor } = appointment;
  const bookingLink = `http://localhost:5173/follow-up/${doctor._id}`;
  const emailOptions = {
    email: patient.email,
    subject: "Follow-up Reminder",
    message: `Hi ${patient.name},\n\nThis is a reminder from Dr. ${doctor.name} to schedule a follow-up appointment.\n\nNote from your doctor: ${note}\n\nClick here to book your follow-up: ${bookingLink}`,
  };
  await sendEmail(emailOptions);

  res.status(201).json({
    success: true,
    data: followUp,
  });
});

// @desc    Generate and download patient intake form PDF for an appointment
// @route   GET /api/appointments/:id/intake-form
exports.getIntakeFormPDF = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'name allergies chronicConditions')
    .populate('doctor', 'name specialty');
  if (!appointment) {
    return res.status(404).json({ msg: 'Appointment not found' });
  }
  // Authorization: Only assigned doctor or patient can download
  if (
    appointment.doctor._id.toString() !== req.user.id &&
    appointment.patient._id.toString() !== req.user.id
  ) {
    return res.status(401).json({ msg: 'User not authorized' });
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=intake-form-${appointment._id}.pdf`);
  const doc = new PDFDocument();
  doc.pipe(res);
  doc.fontSize(20).text('Patient Intake Form', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text('Patient Details:', { underline: true });
  doc.text(`Name: ${appointment.patient.name}`);
  doc.text(`Allergies: ${(appointment.patient.allergies || []).join(', ')}`);
  doc.text(`Chronic Conditions: ${(appointment.patient.chronicConditions || []).join(', ')}`);
  doc.moveDown();
  doc.text('Doctor:', { underline: true });
  doc.text(`Name: ${appointment.doctor.name}`);
  doc.text(`Specialty: ${appointment.doctor.specialty}`);
  doc.moveDown();
  doc.text('Reason for Visit:', { underline: true });
  doc.text(appointment.symptoms || '');
  doc.moveDown();
  doc.text('Previous Medications:', { underline: true });
  doc.text(appointment.previousMeds || '');
  doc.moveDown();
  doc.text('Notes:', { underline: true });
  doc.text('__________________________________________________________');
  doc.text('__________________________________________________________');
  doc.text('__________________________________________________________');
  doc.end();
});

// --- TRIAGE LOGIC TREE ---
const triageLogicTree = {
  'headache': {
    question: 'Is the headache on one side or both?',
    followUps: {
      'one side': {
        question: 'Do you have nausea?',
        followUps: {
          'yes': {
            question: 'Are you sensitive to light?',
            followUps: {
              'yes': { summary: 'Unilateral headache with nausea and photosensitivity, potential migraine.' },
              'no': { summary: 'Unilateral headache with nausea, further evaluation needed.' }
            }
          },
          'no': { summary: 'Unilateral headache, further evaluation needed.' }
        }
      },
      'both sides': { summary: 'Bilateral headache, possible tension-type.' }
    }
  },
  'fever': {
    question: 'How high is your temperature?',
    followUps: {
      'above 102': { question: 'Do you have chills?', followUps: { 'yes': { summary: 'High fever with chills, possible infection.' }, 'no': { summary: 'High fever, monitor closely.' } } },
      'below 102': { summary: 'Low-grade fever, monitor symptoms.' }
    }
  }
};

// @desc    Get next triage question based on user input
// @route   POST /api/triage/question
exports.getTriageQuestion = asyncHandler(async (req, res) => {
  const { symptom, answers } = req.body;
  let node = triageLogicTree[symptom.toLowerCase()];
  if (!node) return res.status(404).json({ msg: 'Symptom not recognized.' });
  let current = node;
  for (const answer of answers || []) {
    if (current.followUps && current.followUps[answer]) {
      current = current.followUps[answer];
    } else {
      break;
    }
  }
  if (current.question) {
    return res.json({ question: current.question });
  } else if (current.summary) {
    return res.json({ summary: current.summary });
  } else {
    return res.json({ msg: 'No further questions.' });
  }
});