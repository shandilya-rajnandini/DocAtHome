const socketManager = require('../utils/socketManager');
const CareCircle = require('../models/CareCircle');
const asyncHandler = require('../middleware/asyncHandler');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getCareCircle = asyncHandler(async (req, res) => {
    const circle = await CareCircle.findOne({ patient: req.user.id }).populate(
      'members.user',
      'name email'
    );
    res.json(circle || { members: [] });

});


exports.inviteMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ error: 'Email and role are required' });
  }
    let circle = await CareCircle.findOne({ patient: req.user.id });

    if (!circle) {
      circle = new CareCircle({ patient: req.user.id, members: [] });
    }

    circle.members.push({
      email,
      role,
      status: 'Pending',
    });

    await circle.save();
    // Attempt to find the invited user by email to get userId
  const invitedUser = await User.findOne({ email });

  if (invitedUser) {
    // Create notification for the invited user
    await Notification.create({
      userId: invitedUser._id,
      message: `You have been invited to join a care circle as a ${role}.`,
      link: '/carecircle', // or specific route if available
      isRead: false,
    });
    
    // Emit real-time notification via Socket.IO
    socketManager.emitToRoom(invitedUser._id.toString(), 'new_notification', {
      message: `You have been invited to join a care circle as a ${role}.`,
      link: '/carecircle'
    });
  }
    res.status(200).json(circle);


});

