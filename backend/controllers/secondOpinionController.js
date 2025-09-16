const SecondOpinion = require('../models/SecondOpinion');
const SecondOpinionFile = require('../models/SecondOpinionFile');
const SecondOpinionResponse = require('../models/SecondOpinionResponse');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { createRazorpayOrder, verifyRazorpayPayment } = require('../utils/paymentUtils');

// @desc    Create a new second opinion request
// @route   POST /api/second-opinions
// @access  Private (Patients only)
const createSecondOpinion = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    medicalHistory,
    currentDiagnosis,
    urgencyLevel,
    specialty,
    responseType
  } = req.body;

  // Calculate price based on specialty and urgency
  const basePrice = 2999; // ₹2999 base price
  const urgencyMultiplier = urgencyLevel === 'urgent' ? 1.5 : urgencyLevel === 'critical' ? 2 : 1;
  const price = Math.round(basePrice * urgencyMultiplier);

  // Set deadline (48 hours from now)
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + 48);

  const secondOpinion = await SecondOpinion.create({
    patientId: req.user.id,
    title,
    description,
    medicalHistory,
    currentDiagnosis,
    urgencyLevel,
    specialty,
    responseType: responseType || 'written',
    price,
    deadline
  });

  res.status(201).json({
    success: true,
    data: secondOpinion
  });
});

// @desc    Get all second opinion requests for a patient
// @route   GET /api/second-opinions/my-requests
// @access  Private (Patients only)
const getMySecondOpinions = asyncHandler(async (req, res) => {
  const { status, specialty } = req.query;

  let filter = { patientId: req.user.id };

  if (status) filter.status = status;
  if (specialty) filter.specialty = specialty;

  const secondOpinions = await SecondOpinion.find(filter)
    .populate('specialistId', 'name email profile.specialization')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: secondOpinions.length,
    data: secondOpinions
  });
});

// @desc    Get second opinion requests for specialists
// @route   GET /api/second-opinions/available
// @access  Private (Doctors only)
const getAvailableSecondOpinions = asyncHandler(async (req, res) => {
  const { specialty, urgencyLevel } = req.query;

  let filter = {
    status: 'pending',
    deadline: { $gt: new Date() }
  };

  if (specialty) filter.specialty = specialty;
  if (urgencyLevel) filter.urgencyLevel = urgencyLevel;

  const secondOpinions = await SecondOpinion.find(filter)
    .populate('patientId', 'name age gender')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: secondOpinions.length,
    data: secondOpinions
  });
});

// @desc    Assign second opinion to specialist
// @route   PUT /api/second-opinions/:id/assign
// @access  Private (Doctors only)
const assignSecondOpinion = asyncHandler(async (req, res) => {
  const secondOpinion = await SecondOpinion.findById(req.params.id);

  if (!secondOpinion) {
    return res.status(404).json({
      success: false,
      message: 'Second opinion request not found'
    });
  }

  if (secondOpinion.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'This request is no longer available'
    });
  }

  // Check if specialist has the required specialty
  const specialist = await User.findById(req.user.id);
  if (!specialist.profile.specialization.includes(secondOpinion.specialty)) {
    return res.status(403).json({
      success: false,
      message: 'You are not qualified for this specialty'
    });
  }

  secondOpinion.specialistId = req.user.id;
  secondOpinion.status = 'assigned';
  secondOpinion.assignedAt = new Date();

  await secondOpinion.save();

  res.json({
    success: true,
    data: secondOpinion
  });
});

// @desc    Upload files for second opinion
// @route   POST /api/second-opinions/:id/upload
// @access  Private
const uploadSecondOpinionFiles = asyncHandler(async (req, res) => {
  const secondOpinion = await SecondOpinion.findById(req.params.id);

  if (!secondOpinion) {
    return res.status(404).json({
      success: false,
      message: 'Second opinion request not found'
    });
  }

  // Check if user is the patient or assigned specialist
  if (secondOpinion.patientId.toString() !== req.user.id &&
      secondOpinion.specialistId?.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to upload files for this request'
    });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  const uploadedFiles = [];

  // Process each uploaded file
  for (const file of req.files) {
    const fileData = {
      secondOpinionId: req.params.id,
      uploadedBy: req.user.id,
      fileName: file.filename,
      originalName: file.originalname,
      fileType: getFileType(file.mimetype),
      mimeType: file.mimetype,
      fileSize: file.size,
      fileUrl: `/uploads/second-opinions/${file.filename}`,
      fileKey: file.filename,
      category: req.body.category || 'medical-report',
      description: req.body.description || ''
    };

    const savedFile = await SecondOpinionFile.create(fileData);
    uploadedFiles.push(savedFile);
  }

  res.status(201).json({
    success: true,
    message: `${uploadedFiles.length} file(s) uploaded successfully`,
    data: uploadedFiles
  });
});

// @desc    Get files for a second opinion
// @route   GET /api/second-opinions/:id/files
// @access  Private
const getSecondOpinionFiles = asyncHandler(async (req, res) => {
  const secondOpinion = await SecondOpinion.findById(req.params.id);

  if (!secondOpinion) {
    return res.status(404).json({
      success: false,
      message: 'Second opinion request not found'
    });
  }

  // Check if user is the patient or assigned specialist
  if (secondOpinion.patientId.toString() !== req.user.id &&
      secondOpinion.specialistId?.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view files for this request'
    });
  }

  const files = await SecondOpinionFile.find({ secondOpinionId: req.params.id })
    .sort({ uploadDate: -1 });

  res.json({
    success: true,
    count: files.length,
    data: files
  });
});

// @desc    Create payment order for second opinion
// @route   POST /api/second-opinions/:id/payment
// @access  Private (Patients only)
const createSecondOpinionPayment = asyncHandler(async (req, res) => {
  const secondOpinion = await SecondOpinion.findById(req.params.id);

  if (!secondOpinion) {
    return res.status(404).json({
      success: false,
      message: 'Second opinion request not found'
    });
  }

  if (secondOpinion.patientId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (secondOpinion.paymentStatus === 'paid') {
    return res.status(400).json({
      success: false,
      message: 'Payment already completed'
    });
  }

  const order = await createRazorpayOrder({
    amount: secondOpinion.price,
    currency: 'INR',
    receipt: `second_opinion_${secondOpinion._id}`
  });

  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      secondOpinionId: secondOpinion._id
    }
  });
});

// @desc    Verify payment for second opinion
// @route   POST /api/second-opinions/:id/payment/verify
// @access  Private (Patients only)
const verifySecondOpinionPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const secondOpinion = await SecondOpinion.findById(req.params.id);

  if (!secondOpinion) {
    return res.status(404).json({
      success: false,
      message: 'Second opinion request not found'
    });
  }

  if (secondOpinion.patientId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  const isVerified = await verifyRazorpayPayment({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature
  });

  if (isVerified) {
    secondOpinion.paymentStatus = 'paid';
    secondOpinion.paymentId = razorpay_payment_id;
    await secondOpinion.save();

    res.json({
      success: true,
      message: 'Payment verified successfully'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

// @desc    Upload video response for second opinion
// @route   POST /api/second-opinions/:id/video-response
// @access  Private (Specialists only)
const uploadVideoResponse = asyncHandler(async (req, res) => {
  const secondOpinion = await SecondOpinion.findById(req.params.id);

  if (!secondOpinion) {
    return res.status(404).json({
      success: false,
      message: 'Second opinion request not found'
    });
  }

  // Check if user is the assigned specialist
  if (secondOpinion.specialistId?.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to upload video response for this request'
    });
  }

  if (secondOpinion.status !== 'assigned') {
    return res.status(400).json({
      success: false,
      message: 'Cannot upload response for this request status'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No video file uploaded'
    });
  }

  // Create or update response
  let response = await SecondOpinionResponse.findOne({
    secondOpinionId: req.params.id,
    specialistId: req.user.id
  });

  if (!response) {
    response = new SecondOpinionResponse({
      secondOpinionId: req.params.id,
      specialistId: req.user.id,
      responseType: 'video'
    });
  }

  response.videoResponse = {
    fileName: req.file.filename,
    originalName: req.file.originalname,
    fileUrl: `/uploads/video-responses/${req.file.filename}`,
    fileSize: req.file.size,
    uploadDate: new Date()
  };

  response.responseDate = new Date();
  await response.save();

  // Update second opinion status
  secondOpinion.status = 'completed';
  secondOpinion.completedAt = new Date();
  await secondOpinion.save();

  res.status(201).json({
    success: true,
    message: 'Video response uploaded successfully',
    data: response
  });
});

// Helper function to determine file type
const getFileType = (mimeType) => {
  const typeMap = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'text/plain': 'txt',
    'video/mp4': 'mp4',
    'video/avi': 'avi',
    'video/mov': 'mov',
    'video/webm': 'webm',
    'application/dicom': 'dicom',
    'application/octet-stream': 'binary'
  };

  return typeMap[mimeType] || 'other';
};

module.exports = {
  createSecondOpinion,
  getMySecondOpinions,
  getAvailableSecondOpinions,
  assignSecondOpinion,
  uploadSecondOpinionFiles,
  getSecondOpinionFiles,
  createSecondOpinionPayment,
  verifySecondOpinionPayment,
  uploadVideoResponse
};