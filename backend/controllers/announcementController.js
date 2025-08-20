const Announcement = require('../models/Announcement.js');
const asyncHandler = require('../middleware/asyncHandler.js');

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = asyncHandler(async (req, res) => {
  const { message, severity, targetRole } = req.body;

  const announcement = new Announcement({
    message,
    severity,
    targetRole,
  });

  const createdAnnouncement = await announcement.save();
  res.status(201).json(createdAnnouncement);
});

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private/Admin
const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({}).sort({ createdAt: -1 });
  res.json(announcements);
});

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private/Admin
const getAnnouncementById = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (announcement) {
    res.json(announcement);
  } else {
    res.status(404);
    throw new Error('Announcement not found');
  }
});

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
const updateAnnouncement = asyncHandler(async (req, res) => {
  const { message, severity, targetRole, isActive } = req.body;

  const announcement = await Announcement.findById(req.params.id);

  if (announcement) {
    announcement.message = message;
    announcement.severity = severity;
    announcement.targetRole = targetRole;
    announcement.isActive = isActive;

    const updatedAnnouncement = await announcement.save();
    res.json(updatedAnnouncement);
  } else {
    res.status(404);
    throw new Error('Announcement not found');
  }
});

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (announcement) {
    await announcement.deleteOne();
    res.json({ message: 'Announcement removed' });
  } else {
    res.status(404);
    throw new Error('Announcement not found');
  }
});

// @desc    Get active announcements
// @route   GET /api/announcements/active
// @access  Public
const getActiveAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(announcements);
});

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements,
};
