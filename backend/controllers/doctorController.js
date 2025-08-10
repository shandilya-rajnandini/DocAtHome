const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');


// @desc    Get all verified doctors, with optional filters
const getDoctors = asyncHandler(async (req, res) => {

    const query = { role: 'doctor', isVerified: true };

    if (req.query.specialty && req.query.specialty !== '') {
      query.specialty = { $regex: req.query.specialty, $options: 'i' };
    }
    if (req.query.city && req.query.city !== '') {
      query.city = { $regex: req.query.city, $options: 'i' };
    }

    const doctors = await User.find(query).select('-password');
    res.json(doctors);

});

// @desc    Get a single doctor by ID
const getDoctorById = asyncHandler(async (req, res) => {

    const doctor = await User.findById(req.params.id).select('-password');

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    res.json(doctor);
});

// This is the most standard way to export multiple functions
module.exports = {
    getDoctors,
    getDoctorById
};