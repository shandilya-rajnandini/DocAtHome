const express = require('express');
const router = express.Router();

// Import all necessary functions from the controller
const { 
    getMyProfile, 
    updateMyProfile, 
    updateMyLocation,
    getMyCareCircle, 
    inviteToCareCircle,
    getProfileById, // <-- Import the new function
    deactivateMyAccount
} = require('../controllers/profileController');

const { protect } = require('../middleware/authMiddleware');

router.put('/me/driver-status', protect, updateMyProfile);


// Route for fetching and updating the LOGGED-IN user's own profile
router.route('/me')
    .get(protect, getMyProfile)
    .put(protect, updateMyProfile)
    .delete(protect, deactivateMyAccount);

// Route for updating user location
router.route('/location')
    .put(protect, updateMyLocation);

// Route for the logged-in user's Care Circle
router.route('/my-care-circle')
    .get(protect, getMyCareCircle);

router.route('/my-care-circle/invite')
    .post(protect, inviteToCareCircle);

// --- NEW PUBLIC ROUTE ---
// Route for fetching ANY user's profile by their ID. This is public.
// This is used for viewing doctor/nurse profiles before booking.
router.get('/:id', getProfileById);


module.exports = router;