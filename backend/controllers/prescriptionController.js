// backend/controllers/prescriptionController.js

const Prescription = require('../models/Prescription'); // adjust path if needed

exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user.id });
    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};