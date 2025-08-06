const express = require('express');
const router = express.Router({ mergeParams: true }); // Important for nested routes
const { createReview, getReviewsForDoctor } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// The router will be mounted on /api/doctors/:doctorId/reviews
router.route('/')
    .post(protect, createReview) // Only logged-in users can post reviews
    .get(getReviewsForDoctor);

module.exports = router;