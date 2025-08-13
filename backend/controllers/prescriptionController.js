// backend/controllers/prescriptionController.js

const Prescription = require('../models/Prescription'); // adjust path if needed
const asyncHandler = require('../middleware/asyncHandler');

exports.getMyPrescriptions = asyncHandler(async (req, res) => {
    const prescriptions = await Prescription.find({ user: req.user.id });
    res.status(200).json(prescriptions);
});