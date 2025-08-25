const express = require('express');
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements,
} = require('../controllers/announcementController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

const router = express.Router();

router
  .route('/')
  .post(protect, admin, createAnnouncement)
  .get(protect, admin, getAnnouncements);

router.route('/active').get(getActiveAnnouncements);

router
  .route('/:id')
  .get(protect, admin, getAnnouncementById)
  .put(protect, admin, updateAnnouncement)
  .delete(protect, admin, deleteAnnouncement);

module.exports = router;
