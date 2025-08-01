const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Search for verified nurses
// @route   GET /api/nurses
exports.getNurses = asyncHandler(async (req, res) => {
  const { specialty, city } = req.query;
  const query = { role: 'nurse', isVerified: true };

  if (specialty) {
    query.specialty = { $regex: specialty, $options: 'i' };
  }
  if (city) {
    query.city = { $regex: city, $options: 'i' };
  }
    const nurses = await User.find(query).select('-password');
    res.json(nurses);
});

// @desc    Get a single nurse by ID
// @route   GET /api/nurses/:id
exports.getNurseById = asyncHandler(async (req, res) => {
    const nurse = await User.findById(req.params.id).select('-password');
    if (!nurse || nurse.role !== 'nurse') {
      return res.status(404).json({ msg: 'Nurse not found' });
    }
    res.json(nurse);
});