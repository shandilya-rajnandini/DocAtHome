const Review = require('../models/Review');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create a new review
// @route   POST /api/doctors/:doctorId/reviews
exports.createReview = asyncHandler(async (req, res) => {
  req.body.doctor = req.params.doctorId;
  req.body.patient = req.user.id; // from protect middleware

    const doctor = await User.findById(req.params.doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    const review = await Review.create(req.body);

    // After creating the review, we must update the doctor's average rating
    const stats = await Review.aggregate([
      { $match: { doctor: doctor._id } },
      { $group: {
          _id: '$doctor',
          numReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(req.params.doctorId, {
        numReviews: stats[0].numReviews,
        averageRating: stats[0].averageRating.toFixed(1)
      });
    } else {
      // This part is redundant if a review was just created, but good for safety
      await User.findByIdAndUpdate(req.params.doctorId, {
        numReviews: 0,
        averageRating: 0
      });
    }

    res.status(201).json({ success: true, data: review });
});

// @desc    Get all reviews for a specific doctor
// @route   GET /api/doctors/:doctorId/reviews
exports.getReviewsForDoctor = asyncHandler(async (req, res) => {
        const reviews = await Review.find({ doctor: req.params.doctorId }).populate({
            path: 'patient',
            select: 'name' // Only show the patient's name
        });
        res.status(200).json({ success: true, count: reviews.length, data: reviews });


});

