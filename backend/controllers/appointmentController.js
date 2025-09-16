const Appointment = require('../models/Appointment');
const User = require('../models/User');
const FollowUp = require('../models/FollowUp');
const { generateSummary } = require('../utils/aiService');
const asyncHandler = require('../middleware/asyncHandler');
const PDFDocument = require('pdfkit');
const IntakeFormLog = require('../models/IntakeFormLog');
const QRCode = require('qrcode');

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
  // Create the appointment in the database
  console.log('shared relay notes found:', sharedRelayNotes);
  const appointment = await Appointment.create({
    ...req.body,
    paymentMethod: paymentMethod || 'external',
    sharedRelayNotes, // <-- array of previous notes
    shareRelayNote: shareRelayNoteBool, // <-- always boolean
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
        if (req.user.role === 'doctor' || req.user.role === 'nurse') {
            query = { doctor: req.user.id };
        } else {
            query = { patient: req.user.id };
        }

        const appointments = await Appointment.find(query)
            .populate('doctor', 'name specialty')
            .populate('patient', 'name allergies chronicConditions');

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
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
    if (appointment.paymentMethod === 'careFund') {
      await User.findByIdAndUpdate(req.user.id, { 
        $inc: { careFundBalance: appointment.fee } // fee is in paise
      });
      
      // Create a transaction record for the refund
      const Transaction = require('../models/Transaction');
      await Transaction.create({
        userId: req.user.id,
        razorpayOrderId: `refund_${Date.now()}`,
        razorpayPaymentId: `refund_payment_${Date.now()}`,
        amount: appointment.fee, // fee is in paise
        currency: 'INR',
        description: `Care Fund Refund for cancelled appointment`,
        status: 'refunded',
      });
    }
    } else if (appointment.doctor.toString() !== req.user.id) {
      // For all other status updates, only the assigned doctor/nurse can update
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
const sendEmail = require('../utils/sendEmail');

// @desc    Schedule a follow-up for an appointment
// @route   POST /api/appointments/:id/schedule-follow-up
exports.scheduleFollowUp = asyncHandler(async (req, res) => {
    const { followUpDate, note } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId).populate('patient doctor');

    if (!appointment) {
        return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Authorization: Only the assigned doctor can schedule a follow-up
    if (req.user.role !== 'doctor' || appointment.doctor._id.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
    }

    if (appointment.status !== 'Completed') {
        return res.status(400).json({ msg: 'Follow-up can only be scheduled for completed appointments' });
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
        subject: 'Follow-up Reminder',
        message: `Hi ${patient.name},\n\nThis is a reminder from Dr. ${doctor.name} to schedule a follow-up appointment.\n\nNote from your doctor: ${note}\n\nClick here to book your follow-up: ${bookingLink}`,
    };
    await sendEmail(emailOptions);

    res.status(201).json({
        success: true,
        data: followUp,
    });
});

// @desc    Generate and return a Patient Intake Form PDF for an appointment
// @route   GET /api/appointments/:id/intake-form
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Basic SSRF protection helpers for external asset fetching in PDF generation
// Explicitly import URL & AbortController to satisfy ESLint (no-undef) in environments where globals may not be recognized.
const { URL } = require('url');
const AbortController = global.AbortController || require('abort-controller');
const isSafeHttpUrl = (u) => {
  try {
    const parsed = new URL(u);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};
const fetchWithTimeout = async (url, opts = {}, ms = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
};

exports.getIntakeForm = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate(
    'patient doctor'
  );

  if (!appointment) {
    return res.status(404).json({ msg: 'Appointment not found' });
  }

  // Authorization: allow only assigned doctor or the patient to download
  const userId = req.user.id;
  if (
    appointment.doctor._id.toString() !== userId &&
    appointment.patient._id.toString() !== userId &&
    req.user.role !== 'admin'
  ) {
    return res.status(401).json({ msg: 'User not authorized' });
  }

  // Create PDF (bufferPages for safe footer switching)
  const doc = new PDFDocument({ margin: 50, bufferPages: true });

  // Stream headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="intake-form-${appointment._id}.pdf"`
  );

  // Prepare file persistence
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'intake-forms');
  let filePath = null;
  try {
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const filename = `intake-form-${appointment._id}-${Date.now()}.pdf`;
    filePath = path.join(uploadsDir, filename);
    const writeStream = fs.createWriteStream(filePath);
    // Pipe PDF to both response and file
    doc.pipe(writeStream);
    doc.pipe(res);
  } catch (_e) {
    // If file persistence fails, just pipe to response
  try { doc.pipe(res); } catch (_e2) { /* ignore */ }
    filePath = null;
  }
  // Enhanced header with optional logo
  const clinicLogoUrl = process.env.CLINIC_LOGO_URL || null;
  const patient = appointment.patient || {};

  try {
    // Header: logo (if available) and title
    const headerY = 40;
    if (clinicLogoUrl && isSafeHttpUrl(clinicLogoUrl)) {
      try {
        const logoRes = await fetchWithTimeout(clinicLogoUrl);
        if (logoRes.ok) {
          const logoBuf = await logoRes.arrayBuffer();
          doc.image(Buffer.from(logoBuf), 50, headerY - 10, { width: 80 });
        }
  } catch (_e) {
        // ignore logo fetch errors
      }
    }

    doc.fontSize(18).font('Helvetica-Bold').text('Patient Intake Form', 150, headerY, { align: 'left' });

    // Add QR code linking to the appointment page (if possible)
    try {
      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
      // Assumption: frontend has an appointment detail route at /appointments/:id
      const appointmentUrl = `${frontendBase}/appointments/${appointment._id}`;
      const qrBuf = await QRCode.toBuffer(appointmentUrl, { type: 'png', width: 256 });
      // place QR under the patient photo or at top-right
      const qrX = 430;
      const qrY = 160;
      doc.image(qrBuf, qrX, qrY, { width: 90 });
      doc.fontSize(9).font('Helvetica').fillColor('black').text('Scan to view appointment', qrX, qrY + 96, { width: 90, align: 'center' });
  } catch (_e) {
      // ignore QR generation errors
    }
    doc.moveDown(2);

    // Small patient photo on the top-right if available
    if (patient.profilePictureUrl && isSafeHttpUrl(patient.profilePictureUrl)) {
      try {
        const imgRes = await fetchWithTimeout(patient.profilePictureUrl);
        if (imgRes.ok) {
          const imgBuf = await imgRes.arrayBuffer();
          // place image to the right
          doc.image(Buffer.from(imgBuf), 430, 60, { width: 90, height: 90, fit: [90, 90] });
        }
  } catch (_e) {
        // ignore image fetch errors
      }
    }

    doc.moveDown(1.5);

    // Patient Details box
    doc.rect(50, 150, 500, 110).stroke();
    doc.fontSize(12).font('Helvetica-Bold').text('Patient Details', 60, 158);
    doc.font('Helvetica').fontSize(11).text(`Name: ${patient.name || ''}`, 60, 178);
    doc.text(`Email: ${patient.email || ''}`, 60, 195);
    doc.text(`Phone: ${patient.phone || ''}`, 300, 178);
    doc.text(`Booking Type: ${appointment.bookingType || ''}`, 300, 195);
    doc.text(`Appointment: ${appointment.appointmentDate || ''} ${appointment.appointmentTime || ''}`, 60, 212);

    // Medical info (allergies, chronic conditions)
    doc.moveDown(6);
    doc.fontSize(13).font('Helvetica-Bold').text('Medical Background', 50, 270);
    doc.font('Helvetica').fontSize(11).text(`Allergies: ${(patient.allergies || []).join(', ') || 'None'}`, 50, 290);
    doc.text(`Chronic Conditions: ${(patient.chronicConditions || []).join(', ') || 'None'}`, 50, 307);

    // Reason for Visit
    doc.moveDown(2);
    doc.fontSize(13).font('Helvetica-Bold').text('Reason for Visit', 50, 335);
    doc.font('Helvetica').fontSize(11).text(appointment.symptoms || '', { width: 500, align: 'left' , indent: 0});

    // Previous Medications
    doc.moveDown(2);
    doc.fontSize(13).font('Helvetica-Bold').text('Previous Medications', 50, 420);
    doc.font('Helvetica').fontSize(11).text(appointment.previousMeds || 'None', { width: 500 });

    // Include report image if present (small preview)
    if (appointment.reportImage && isSafeHttpUrl(appointment.reportImage)) {
      try {
        const rptRes = await fetchWithTimeout(appointment.reportImage, {}, 8000);
        if (rptRes.ok) {
          const rptBuf = await rptRes.arrayBuffer();
          doc.addPage();
          doc.fontSize(14).font('Helvetica-Bold').text('Attached Report', 50, 60);
          doc.image(Buffer.from(rptBuf), 50, 90, { fit: [500, 600], align: 'center' });
        }
  } catch (_e) {
        // ignore report fetch errors
      }
    }

    // Space for doctor to write notes
    if (!appointment.reportImage) {
      doc.addPage();
    }
    doc.fontSize(13).font('Helvetica-Bold').text('Doctor Notes', 50, 60);
    // Draw several ruled lines
    let notesStartY = 90;
    for (let i = 0; i < 18; i++) {
      doc.moveTo(50, notesStartY).lineTo(560, notesStartY).strokeOpacity(0.05).stroke();
      notesStartY += 25;
    }

    // Add footer to each page safely
    const addFooter = (pageIndex) => {
      try {
    doc.switchToPage(pageIndex);
    doc.fontSize(8).fillColor('gray').text(`Generated by DocAtHome`, 50, 760, { align: 'left' });
    doc.text(`Page ${pageIndex + 1}`, -50, 760, { align: 'right' });
  } catch (_e) {
        // ignore footer errors
      }
    };

    // Add footer for the current buffered page (page 0) now
    addFooter(0);
    // Also respond to page additions and add footer to new pages
    doc.on('pageAdded', () => {
      const current = doc.bufferedPageRange().count - 1;
      addFooter(current);
    });

  } catch (err) {
    // If anything goes wrong during PDF generation, still attempt to finalize
    console.error('PDF generation error:', err.message);
  }

  // Non-blocking audit log: record that an intake form was generated
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    const ua = req.headers['user-agent'] || '';
    const logData = { appointment: appointment._id, generatedBy: req.user.id, role: req.user.role, ip, userAgent: ua };
    if (filePath) {
      // convert to public URL
      const publicPath = `/uploads/intake-forms/${path.basename(filePath)}`;
      logData.fileUrl = publicPath;
    }
  IntakeFormLog.create(logData).catch((_e) => {
      // Log but don't fail the request (using generic message to avoid referencing undefined variable)
      console.error('Failed to record intake form log');
    });
  } catch (_e) {
    // ignore
  }

  doc.end();
});
