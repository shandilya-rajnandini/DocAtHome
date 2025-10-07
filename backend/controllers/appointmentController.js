/* eslint-disable quotes */
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const FollowUp = require("../models/FollowUp");
const { generateSummary } = require("../utils/aiService");
const asyncHandler = require("../middleware/asyncHandler");
const Notification = require("../models/Notification");
const socketManager = require("../utils/socketManager");
const PDFDocument = require("pdfkit");
const sendEmail = require("../utils/sendEmail");

// ----------------------------
// CONTROLLER FUNCTIONS
// ----------------------------

// 1️⃣ Create a new appointment
exports.createAppointment = asyncHandler(async (req, res) => {
  req.body.patient = req.user.id;
  const { doctor, fee, paymentMethod = "external", shareRelayNote } = req.body;
  const shareRelayNoteBool = !!shareRelayNote;

  const doctorExists = await User.findById(doctor);
  if (!doctorExists || (doctorExists.role !== "doctor" && doctorExists.role !== "nurse")) {
    return res.status(404).json({ msg: "Professional not found" });
  }

  if (paymentMethod === "careFund") {
    const patient = await User.findById(req.user.id);
    if (!patient) return res.status(404).json({ msg: "Patient not found" });
    if (patient.careFundBalance < fee) {
      return res.status(400).json({ msg: `Insufficient care fund balance. Available: ₹${patient.careFundBalance}, Required: ₹${fee}` });
    }
    await User.findByIdAndUpdate(req.user.id, { $inc: { careFundBalance: -fee } });
    const Transaction = require("../models/Transaction");
    await Transaction.create({
      userId: req.user.id,
      razorpayOrderId: `care_fund_${Date.now()}`,
      razorpayPaymentId: `care_fund_payment_${Date.now()}`,
      amount: fee,
      currency: "INR",
      description: `Care Fund Payment for appointment with ${doctorExists.name}`,
      status: "paid",
    });
  }

  let sharedRelayNotes = [];
  if (shareRelayNote) {
    const prevAppointments = await Appointment.find({
      patient: req.user.id,
      status: "Completed",
      relayNote: { $exists: true, $ne: "" },
    })
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .populate("doctor", "name specialty");

    sharedRelayNotes = prevAppointments.map((appt) => ({
      note: appt.relayNote,
      doctorName: appt.doctor?.name || "",
      doctorDesignation: appt.doctor?.specialty || "",
    }));
  }

  const appointment = await Appointment.create({
    ...req.body,
    paymentMethod: paymentMethod || "external",
    sharedRelayNotes,
    shareRelayNote: shareRelayNoteBool,
  });

  await Notification.create({
    userId: doctor,
    message: `New appointment booked by ${req.user.name || "a patient"}.`,
    link: `/appointments/${appointment._id}`,
    isRead: false,
  });

  socketManager.emitToRoom(doctor.toString(), "new_notification", {
    message: `New appointment booked by ${req.user.name || "a patient"}.`,
    link: `/appointments/${appointment._id}`,
  });

  res.status(201).json({
    success: true,
    data: appointment,
    message:
      paymentMethod === "careFund"
        ? `Appointment booked successfully! ₹${fee} deducted from your care fund.`
        : "Appointment booked successfully!",
  });
});

// 2️⃣ Get logged-in user's appointments
exports.getMyAppointments = asyncHandler(async (req, res) => {
  let query;
  if (req.user.role === "doctor" || req.user.role === "nurse") query = { doctor: req.user.id };
  else query = { patient: req.user.id };

  const appointments = await Appointment.find(query)
    .populate("doctor", "name specialty")
    .populate("patient", "name allergies chronicConditions");

  res.status(200).json({ success: true, count: appointments.length, data: appointments });
});

// 3️⃣ Update appointment status
exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, doctorNotes } = req.body;
  let appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ msg: "Appointment not found" });

  // Authorization & cancellation logic
  if (
    status === "Cancelled" &&
    appointment.patient.toString() === req.user.id
  ) {
    const appointmentDateTime = new Date(appointment.appointmentDate);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilAppointment < 24) return res.status(400).json({ msg: "Cancellations must be made at least 24 hours in advance" });

    if (appointment.paymentMethod === "careFund") {
      await User.findByIdAndUpdate(req.user.id, { $inc: { careFundBalance: appointment.fee } });
      const Transaction = require("../models/Transaction");
      await Transaction.create({
        userId: req.user.id,
        razorpayOrderId: `refund_${Date.now()}`,
        razorpayPaymentId: `refund_payment_${Date.now()}`,
        amount: appointment.fee,
        currency: "INR",
        description: `Care Fund Refund for cancelled appointment`,
        status: "refunded",
      });
    }
  } else if (appointment.doctor.toString() !== req.user.id) {
    return res.status(401).json({ msg: "User not authorized to update this appointment" });
  }

  appointment.status = status;
  if (doctorNotes !== undefined) appointment.doctorNotes = doctorNotes;
  await appointment.save();

  await Notification.create({
    userId: appointment.patient,
    message: `Your appointment on ${appointment.appointmentDate} is now '${appointment.status}'.`,
    link: `/appointments/${appointment._id}`,
    isRead: false,
  });

  socketManager.emitToRoom(appointment.patient.toString(), "new_notification", {
    message: `Your appointment on ${appointment.appointmentDate} is now '${appointment.status}'.`,
    link: `/appointments/${appointment._id}`,
  });

  res.json(appointment);
});

// 4️⃣ Save voice note
exports.saveVoiceNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { voiceUrl } = req.body;
  if (!voiceUrl) return res.status(400).json({ success: false, message: "Voice URL is required." });

  const appointment = await Appointment.findByIdAndUpdate(id, { voiceRecording: voiceUrl }, { new: true });
  if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found." });

  res.json({ success: true, data: appointment });
});

// 5️⃣ Update relay note
exports.updateRelayNote = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, { relayNote: req.body.relayNote }, { new: true });
  if (!appointment) return res.status(404).json({ msg: "Appointment not found" });
  res.json({ success: true, data: appointment });
});

// 6️⃣ Schedule follow-up
exports.scheduleFollowUp = asyncHandler(async (req, res) => {
  const { followUpDate, note } = req.body;
  const appointmentId = req.params.id;
  const appointment = await Appointment.findById(appointmentId).populate("patient doctor");
  if (!appointment) return res.status(404).json({ msg: "Appointment not found" });
  if (req.user.role !== "doctor" || appointment.doctor._id.toString() !== req.user.id)
    return res.status(401).json({ msg: "User not authorized" });
  if (appointment.status !== "Completed")
    return res.status(400).json({ msg: "Follow-up can only be scheduled for completed appointments" });

  const followUp = await FollowUp.create({
    patient: appointment.patient,
    doctor: appointment.doctor,
    appointment: appointmentId,
    followUpDate,
    note,
  });

  // Send email
  await sendEmail({
    email: appointment.patient.email,
    subject: "Follow-up Reminder",
    message: `Hi ${appointment.patient.name},\n\nReminder from Dr. ${appointment.doctor.name}.\n\nNote: ${note}\n\nClick here to book: http://localhost:5173/follow-up/${appointment.doctor._id}`,
  });

  res.status(201).json({ success: true, data: followUp });
});

// 7️⃣ Generate intake form PDF
exports.getIntakeFormPDF = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("patient", "name allergies chronicConditions")
    .populate("doctor", "name specialty");
  if (!appointment) return res.status(404).json({ msg: "Appointment not found" });
  if (appointment.doctor._id.toString() !== req.user.id && appointment.patient._id.toString() !== req.user.id)
    return res.status(401).json({ msg: "User not authorized" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=intake-form-${appointment._id}.pdf`);
  const doc = new PDFDocument();
  doc.pipe(res);
  doc.fontSize(20).text("Patient Intake Form", { align: "center" });
  doc.fontSize(14).text(`Name: ${appointment.patient.name}`);
  doc.text(`Allergies: ${(appointment.patient.allergies || []).join(", ")}`);
  doc.text(`Chronic Conditions: ${(appointment.patient.chronicConditions || []).join(", ")}`);
  doc.text(`Doctor: ${appointment.doctor.name} (${appointment.doctor.specialty})`);
  doc.text(`Reason: ${appointment.symptoms || ""}`);
  doc.text(`Previous Medications: ${appointment.previousMeds || ""}`);
  doc.text(`Notes: __________________________________________________________`);
  doc.end();
});

// 8️⃣ Respond to reschedule
exports.respondReschedule = asyncHandler(async (req, res) => {
  const { response } = req.body; // approved or denied
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });

  if (!appointment.rescheduleRequest || !appointment.rescheduleRequest.newDate) {
    return res.status(400).json({ message: "No reschedule request found" });
  }

  if (response === "approved") {
    appointment.appointmentDate = appointment.rescheduleRequest.newDate;
    appointment.appointmentTime = appointment.rescheduleRequest.newTime;
  }

  appointment.rescheduleRequest.status = response;
  await appointment.save();

  res.json({ message: `Reschedule ${response}`, appointment });
});

// 9️⃣ Triage question
const triageLogicTree = {
  headache: { /* ... your existing tree ... */ },
  fever: { /* ... your existing tree ... */ },
};

exports.getTriageQuestion = asyncHandler(async (req, res) => {
  const { symptom, answers } = req.body;
  let node = triageLogicTree[symptom.toLowerCase()];
  if (!node) return res.status(404).json({ msg: "Symptom not recognized." });
  let current = node;
  for (const answer of answers || []) {
    if (current.followUps && current.followUps[answer]) current = current.followUps[answer];
    else break;
  }
  if (current.question) res.json({ question: current.question });
  else if (current.summary) res.json({ summary: current.summary });
  else res.json({ msg: "No further questions." });
});

// ----------------------------
// EXPORT CONTROLLERS
// ----------------------------
module.exports = {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  getAppointmentSummary,
  saveVoiceNote,
  scheduleFollowUp,
  updateRelayNote,
  getIntakeFormPDF,
  getTriageQuestion,
  respondReschedule,
};
