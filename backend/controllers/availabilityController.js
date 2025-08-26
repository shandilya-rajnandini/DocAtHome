const Availability = require('../models/Availability');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get professional's availability
// @route   GET /api/availability/:id
exports.getAvailability = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const availability = await Availability.findOne({ professional: id });
    if (!availability) {
        return res.status(404).json({ msg: 'Availability not found' });
    }
    res.json(availability);
});

// @desc    Update professional's availability
// @route   POST /api/availability/:id
exports.updateAvailability = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { availableDates, timeSlots, workingDays } = req.body;
    let availability = await Availability.findOne({ professional: id });
    if (!availability) {
        availability = new Availability({ professional: id });
    }
    if (availableDates) availability.availableDates = availableDates;
    if (timeSlots) availability.defaultTimeSlots = timeSlots;
    if (workingDays) availability.workingDays = workingDays;
    await availability.save();
    res.json(availability);
});