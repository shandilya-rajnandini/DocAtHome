// controllers/videoCallController.js
const VideoCall = require('../models/VideoCall');
const CareCircle = require('../models/CareCircle');
const asyncHandler = require('../middleware/asyncHandler');
const { randomUUID } = require('crypto');

// Generate unique call ID
const generateCallId = () => `call_${randomUUID()}`;

// Start a new family bridge call
exports.startFamilyBridgeCall = asyncHandler(async (req, res) => {
  const { patientId, appointmentId, location, address } = req.body;

  if (!patientId) {
    return res.status(400).json({ error: 'Patient ID is required' });
  }

  // Verify user is a professional
  if (!['doctor', 'nurse', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only professionals can start calls' });
  }

  // Verify the professional has access to this patient
  const careCircle = await CareCircle.findOne({
    patient: patientId,
    'members.user': req.user.id,
    'members.status': 'Active'
  });

  if (!careCircle) {
    return res.status(403).json({ error: 'You do not have access to start calls for this patient' });
  }

  // Create the video call
  const callId = generateCallId();
  const videoCall = new VideoCall({
    patient: patientId,
    professional: req.user.id,
    appointment: appointmentId,
    callId,
    status: 'initiated',
    participants: [{
      user: req.user.id,
      role: 'professional',
      status: 'joined',
      joinedAt: new Date()
    }],
    location,
    address
  });

  await videoCall.save();

  // Get family members to notify
  const familyMembers = careCircle.members.filter(
    member => member.role === 'Family' && member.status === 'Active'
  );

  // Populate family member details for notification
  const populatedCall = await VideoCall.findById(videoCall._id)
    .populate('patient', 'name')
    .populate('professional', 'name')
    .populate('participants.user', 'name email');

  res.status(201).json({
    call: populatedCall,
    familyMembers: familyMembers.map(member => ({
      user: member.user,
      email: member.email
    }))
  });
});

// Join an active call
exports.joinCall = asyncHandler(async (req, res) => {
  const { callId } = req.params;

  const videoCall = await VideoCall.findOne({ callId });

  if (!videoCall) {
    return res.status(404).json({ error: 'Call not found' });
  }

  if (videoCall.status !== 'active' && videoCall.status !== 'initiated') {
    return res.status(400).json({ error: 'Call is not active' });
  }

  // Check if user is authorized to join
  const isParticipant = videoCall.participants.some(p => p.user.toString() === req.user.id);

  if (!isParticipant) {
    // Check if user is in the care circle
    const careCircle = await CareCircle.findOne({
      patient: videoCall.patient,
      'members.user': req.user.id,
      'members.status': 'Active'
    });

    if (!careCircle) {
      return res.status(403).json({ error: 'You are not authorized to join this call' });
    }

    // Add user as participant
    videoCall.participants.push({
      user: req.user.id,
      role: careCircle.members.find(m => m.user.toString() === req.user.id).role.toLowerCase(),
      status: 'joined',
      joinedAt: new Date()
    });
  } else {
    // Update existing participant status
    const participant = videoCall.participants.find(p => p.user.toString() === req.user.id);
    participant.status = 'joined';
    participant.joinedAt = new Date();
  }

  // Update call status to active if not already
  if (videoCall.status === 'initiated') {
    videoCall.status = 'active';
    videoCall.startedAt = new Date();
  }

  await videoCall.save();

  const populatedCall = await VideoCall.findById(videoCall._id)
    .populate('patient', 'name')
    .populate('professional', 'name')
    .populate('participants.user', 'name email');

  res.json({ call: populatedCall });
});

// End a call
exports.endCall = asyncHandler(async (req, res) => {
  const { callId } = req.params;

  const videoCall = await VideoCall.findOne({ callId });

  if (!videoCall) {
    return res.status(404).json({ error: 'Call not found' });
  }

  // Only the professional or patient can end the call
  if (videoCall.professional.toString() !== req.user.id &&
      videoCall.patient.toString() !== req.user.id) {
    return res.status(403).json({ error: 'You are not authorized to end this call' });
  }

  videoCall.status = 'ended';
  videoCall.endedAt = new Date();

  if (videoCall.startedAt) {
    videoCall.duration = Math.floor((videoCall.endedAt - videoCall.startedAt) / 1000);
  }

  // Update all active participants
  videoCall.participants.forEach(participant => {
    if (participant.status === 'joined' && !participant.leftAt) {
      participant.leftAt = new Date();
    }
  });

  await videoCall.save();

  res.json({ message: 'Call ended successfully', call: videoCall });
});

// Get call history for a user
exports.getCallHistory = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  // Validate and sanitize pagination parameters
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

  // Check if user has access to this patient's calls
  let query = {};

  if (req.user.role === 'patient') {
    query.patient = req.user.id;
  } else {
    // For professionals, check care circle access
    const careCircle = await CareCircle.findOne({
      patient: patientId,
      'members.user': req.user.id,
      'members.status': 'Active'
    });

    if (!careCircle) {
      return res.status(403).json({ error: 'Access denied' });
    }

    query.patient = patientId;
  }

  const calls = await VideoCall.find(query)
    .populate('patient', 'name')
    .populate('professional', 'name')
    .populate('participants.user', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await VideoCall.countDocuments(query);

  res.json({
    calls,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get active call for a patient
exports.getActiveCall = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  // Access control check
  if (req.user.role === 'patient' && req.user.id !== patientId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  if (req.user.role !== 'patient') {
    const careCircle = await CareCircle.findOne({
      patient: patientId,
      'members.user': req.user.id,
      'members.status': 'Active'
    });
    if (!careCircle) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  const activeCall = await VideoCall.findOne({
    patient: patientId,
    status: { $in: ['initiated', 'active'] }
  })
  .populate('patient', 'name')
  .populate('professional', 'name')
  .populate('participants.user', 'name email')
  .sort({ createdAt: -1 });

  if (!activeCall) {
    return res.status(404).json({ error: 'No active call found' });
  }

  res.json({ call: activeCall });
});