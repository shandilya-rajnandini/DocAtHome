const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all users pending verification
// @route   GET /api/admin/pending

exports.getPendingUsers = asyncHandler(async (req, res) => {
    const pendingUsers = await User.find({ isVerified: false, role: { $in: ['doctor', 'nurse'] } });
    res.json(pendingUsers);
  
});

// @desc    Approve a user by ID
// @route   PUT /api/admin/approve/:id
exports.approveUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    user.isVerified = true;
    await user.save();

    res.json({ msg: 'User approved successfully' });
});