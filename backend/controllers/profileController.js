const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const Notification = require('../models/Notification');
const socketManager = require('../utils/socketManager');

// Helper function to calculate the centroid of a polygon
const calculatePolygonCentroid = (coordinates) => {
  let totalLat = 0;
  let totalLng = 0;
  let totalPoints = 0;

  // coordinates is an array of [lng, lat] pairs
  for (const coord of coordinates) {
    if (coord && coord.length >= 2) {
      totalLng += coord[0]; // longitude
      totalLat += coord[1]; // latitude
      totalPoints++;
    }
  }

  return [totalLng / totalPoints, totalLat / totalPoints]; // Return as [lng, lat] for GeoJSON
};

// @desc    Get current user's profile
// @route   GET /api/profile/me
exports.getMyProfile = asyncHandler(async (req, res) => {
    // req.user.id comes from the 'protect' middleware
    const profile = await User.findById(req.user.id).select('-password');
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.json(profile);
});

// @desc    Update current user's profile
// @route   PUT /api/profile/me
exports.updateMyProfile = asyncHandler(async (req, res) => {
  const { name, city, experience, qualifications, bio, profilePictureUrl, serviceArea } = req.body;

  const profileFields = {};
  if (name) profileFields.name = name;
  if (city) profileFields.city = city;
  if (experience) profileFields.experience = experience;
  
  // Handle qualifications safely
  if (qualifications) {
    if (typeof qualifications === 'string') {
      profileFields.qualifications = qualifications.split(',').map(q => q.trim());
    } else if (Array.isArray(qualifications)) {
      profileFields.qualifications = qualifications;
    }
  }
  
  if (bio) profileFields.bio = bio;
  if (profilePictureUrl) profileFields.profilePictureUrl = profilePictureUrl;

  // Accept GeoJSON Polygon for professional service area (optional)
  if (serviceArea !== undefined) {
    if (serviceArea === null) {
      // Allow clearing the service area
      profileFields.serviceArea = null;
      profileFields.serviceAreaCentroid = null;
    } else {
      try {
        // Allow serviceArea to be a parsed object or a JSON string
        const area = typeof serviceArea === 'string' ? JSON.parse(serviceArea) : serviceArea;
        if (
          area &&
          area.type === 'Polygon' &&
          Array.isArray(area.coordinates) &&
          Array.isArray(area.coordinates[0])
        ) {
          // Ensure the polygon is properly closed (first and last coordinates are the same)
          const coordinates = area.coordinates[0];
          const firstCoord = coordinates[0];
          const lastCoord = coordinates[coordinates.length - 1];
          
          // If not properly closed, close it
          if (firstCoord[0] !== lastCoord[0] || firstCoord[1] !== lastCoord[1]) {
            coordinates.push([firstCoord[0], firstCoord[1]]);
          }
          
          // Calculate centroid from the service area coordinates (excluding the closing point)
          const centroid = calculatePolygonCentroid(coordinates.slice(0, -1));
          
          area.coordinates[0] = coordinates;
          profileFields.serviceArea = area;
          
          // Store centroid as a separate GeoJSON Point field
          profileFields.serviceAreaCentroid = {
            type: 'Point',
            coordinates: centroid
          };
          
          console.log(`Calculated centroid ${centroid} for service area for user ${req.user.id}`);
        } else {
          return res.status(400).json({ msg: 'Invalid serviceArea. Expect GeoJSON Polygon.' });
        }
      } catch (_e) {
        return res.status(400).json({ msg: 'Invalid serviceArea JSON.' });
      }
    }
  }

    let profile = await User.findById(req.user.id);
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    profile = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(profile);
});

// @desc    Update current user's location
// @route   PUT /api/profile/location
exports.updateMyLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ msg: 'Latitude and longitude are required' });
  }

  const locationData = {
    type: 'Point',
    coordinates: [parseFloat(longitude), parseFloat(latitude)]
  };

  const profile = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { location: locationData } },
    { new: true, runValidators: true }
  ).select('-password');

  if (!profile) {
    return res.status(404).json({ msg: 'Profile not found' });
  }

  res.json({ 
    message: 'Location updated successfully',
    location: profile.location 
  });
});


// ... existing getMyProfile and updateMyProfile functions

const CareCircle = require('../models/CareCircle');
const _Vital = require('../models/Vital');

// @desc    Deactivate (soft delete) current user's account
// @route   DELETE /api/profile/me
exports.deactivateMyAccount = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }
    user.isActive = false;
    await user.save();
    res.status(200).json({ msg: 'Account deactivated successfully.' });
});

// @desc    Get the Care Circle for the logged-in patient
// @route   GET /api/profile/my-care-circle
exports.getMyCareCircle = asyncHandler(async (req, res) => {
        const circle = await CareCircle.findOne({ patient: req.user.id }).populate('members.user', 'name role');
        if (!circle) {
            // If no circle exists, create one for the patient
            const newCircle = await CareCircle.create({ patient: req.user.id, members: [] });
            return res.json(newCircle);
        }
        res.json(circle);

});

// @desc    Invite a member to the Care Circle
// @route   POST /api/profile/my-care-circle/invite
exports.inviteToCareCircle = asyncHandler(async (req, res) => {
    const { email, role } = req.body;
        const circle = await CareCircle.findOne({ patient: req.user.id });
        // In a real app, you would send an email invite. Here, we'll just add them.
        // We'll also assume the invited user already has an account for simplicity.
        const memberUser = await User.findOne({ email });
        
        circle.members.push({
            user: memberUser ? memberUser._id : null,
            email,
            role,
            status: 'Active' // Auto-activating for this demo
        });
        await circle.save();
        if (memberUser) {
          await Notification.create({
            userId: memberUser._id,
            message: `You have been invited to join a care circle as a ${role}.`,
            link: '/carecircle', // Adjust route as needed
            isRead: false,
          });

          // Emit notification in real-time
          socketManager.emitToRoom(memberUser._id.toString(), 'new_notification', {
            message: `You have been invited to join a care circle as a ${role}.`,
            link: '/carecircle'
          });
        }
        res.json(circle);
});

//... (keep existing functions)

// @desc    Get a user profile by ID (for public viewing)
// @route   GET /api/profile/:id
exports.getProfileById = asyncHandler(async (req, res) => {
    const profile = await User.findById(req.params.id).select('-password');
    if (!profile) {
      return res.status(404).json({ msg: 'User not found' });
    }
    // We don't check the role here, so it works for both doctors and nurses
    res.json(profile);
});