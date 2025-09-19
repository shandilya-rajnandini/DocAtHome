const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const AmbulanceRequest = require('../models/AmbulanceRequest');
const socketManager = require('../utils/socketManager');
const { validateCoordinates } = require('../utils/geoUtils');
const Notification = require('../models/Notification');

/**
 * @desc    Book an ambulance
 * @route   POST /api/ambulance/book
 * @access  Public (for emergency situations)
 */
exports.bookAmbulance = asyncHandler(async (req, res) => {
  const {
    patientName,
    contactNumber,
    address,
    city,
    coordinates,
    emergencyType = 'General',
    notes
  } = req.body;

  // Validate required fields
  if (!patientName || !contactNumber || !address || !city || !coordinates) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  // Validate coordinates
  if (!validateCoordinates(coordinates)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates format'
    });
  }

  // Determine if request is from registered user
  const isRegistered = req.user ? true : false;

  // Create ambulance request
  const request = await AmbulanceRequest.create({
    patient: req.user ? req.user._id : null,
    isRegistered,
    patientName,
    contactNumber,
    pickupLocation: {
      address,
      coordinates: {
        type: 'Point',
        coordinates // [longitude, latitude]
      }
    },
    city,
    emergencyType,
    notes
  });

  // Find online drivers in the city
  const drivers = await User.find({
    role: 'ambulance',
    isOnline: true,
    city: city.toLowerCase()
  }).select('_id name');

  // Emit socket event to city room
  const cityRoom = socketManager.getCityRoom(city);
  socketManager.emitToRoom(cityRoom, 'new_ambulance_request', {
    requestId: request._id,
    patientName,
    address,
    emergencyType,
    timestamp: request.createdAt
  });

  // Return success response
  return res.status(201).json({
    success: true,
    data: {
      requestId: request._id,
      availableDrivers: drivers.length,
      message: drivers.length > 0 
        ? `Ambulance request sent to ${drivers.length} drivers in ${city}`
        : 'No drivers currently online in your city. Emergency services have been notified.'
    }
  });
});

/**
 * @desc    Driver responds to ambulance request
 * @route   PUT /api/ambulance/respond/:requestId
 * @access  Private (ambulance drivers only)
 */
exports.respondToRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { action } = req.body;

  // Validate action
  if (!['accept', 'decline'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: 'Action must be either \'accept\' or \'decline\''
    });
  }

  // Check if user is ambulance driver
  if (req.user.role !== 'ambulance') {
    return res.status(403).json({
      success: false,
      message: 'Only ambulance drivers can respond to requests'
    });
  }

  // Find request
  const request = await AmbulanceRequest.findById(requestId);
  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Ambulance request not found'
    });
  }

  // Check if request is still pending
  if (request.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Request already ${request.status}`
    });
  }

  if (action === 'accept') {
    // Atomically update request to prevent race conditions
    const updatedRequest = await AmbulanceRequest.findOneAndUpdate(
      { _id: requestId, status: 'pending' },
      {
        status: 'accepted',
        driver: req.user._id,
        acceptedAt: Date.now()
      },
      { new: true }
    );

    // If request was already taken by another driver
    if (!updatedRequest) {
      return res.status(400).json({
        success: false,
        message: 'This request has already been accepted by another driver'
      });
    }

    // Notify other drivers that request is taken
    socketManager.emitToRoom(
      socketManager.getCityRoom(request.city),
      'request_taken',
      { requestId }
    );

    // Notify patient via Notification document
    if (request.patient) {
      await Notification.create({
        userId: request.patient,
        message: `${req.user.name} has accepted your ambulance request. Estimated arrival: ~15 minutes.`,
        link: `/ambulance/requests/${request._id}`,
        isRead: false,
      });

      // Real-time notification to patient via Socket.IO
    socketManager.emitToRoom(
      request.patient.toString(),
      'new_notification',
      {
        message: `${req.user.name} has accepted your ambulance request. Estimated arrival: ~15 minutes.`,
        link: `/ambulance/requests/${request._id}`
      }
     );
     
      // Socket notification
      socketManager.emitToRoom(
        `user:${request.patient}`,
        'driver_accepted',
        {
          requestId,
          driverName: req.user.name,
          estimatedArrival: '15 minutes' // This would be dynamically calculated
        }
      );
    }

    return res.status(200).json({
      success: true,
      data: updatedRequest
    });
  } else {
    // Just log decline, no state change needed
    return res.status(200).json({
      success: true,
      message: 'Request declined'
    });
  }
});

/**
 * @desc    Update driver online status
 * @route   PUT /api/ambulance/status
 * @access  Private (ambulance drivers only)
 */
exports.updateDriverStatus = asyncHandler(async (req, res) => {
  const { isOnline } = req.body;

  // Validate input
  if (typeof isOnline !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isOnline must be a boolean value'
    });
  }

  // Check if user is ambulance driver
  if (req.user.role !== 'ambulance') {
    return res.status(403).json({
      success: false,
      message: 'Only ambulance drivers can update status'
    });
  }

  // Update user's online status
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { isOnline },
    { new: true }
  ).select('name city isOnline');

  return res.status(200).json({
    success: true,
    data: updatedUser
  });
});
