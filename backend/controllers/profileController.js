const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

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
          profileFields.serviceArea = area;
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



// ... existing getMyProfile and updateMyProfile functions

const CareCircle = require('../models/CareCircle');
const _Vital = require('../models/Vital');

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