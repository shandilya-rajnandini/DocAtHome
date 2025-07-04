const User = require('../models/User');

// @desc    Get all users pending verification
// @route   GET /api/admin/pending
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ isVerified: false, role: { $in: ['doctor', 'nurse'] } });
    res.json(pendingUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Approve a user by ID
// @route   PUT /api/admin/approve/:id
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    user.isVerified = true;
    await user.save();
    res.json({ msg: 'User approved successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};