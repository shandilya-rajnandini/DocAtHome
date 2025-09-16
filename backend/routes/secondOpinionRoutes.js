const express = require('express');
const router = express.Router();
const {
  createSecondOpinion,
  getMySecondOpinions,
  getAvailableSecondOpinions,
  assignSecondOpinion,
  uploadSecondOpinionFiles,
  getSecondOpinionFiles,
  createSecondOpinionPayment,
  verifySecondOpinionPayment,
  uploadVideoResponse
} = require('../controllers/secondOpinionController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { secondOpinionUpload, videoResponseUpload, handleMulterError } = require('../utils/uploadUtils');

// Patient routes
router.post('/', protect, requireRole(['patient']), createSecondOpinion);
router.get('/my-requests', protect, requireRole(['patient']), getMySecondOpinions);
router.post('/:id/upload', protect, secondOpinionUpload.array('files', 20), uploadSecondOpinionFiles);
router.get('/:id/files', protect, getSecondOpinionFiles);
router.post('/:id/payment', protect, requireRole(['patient']), createSecondOpinionPayment);
router.post('/:id/payment/verify', protect, requireRole(['patient']), verifySecondOpinionPayment);

// Doctor routes
router.get('/available', protect, requireRole(['doctor']), getAvailableSecondOpinions);
router.put('/:id/assign', protect, requireRole(['doctor']), assignSecondOpinion);
router.post('/:id/video-response', protect, requireRole(['doctor']), videoResponseUpload.single('video'), uploadVideoResponse);

// Error handling middleware for multer
router.use(handleMulterError);

module.exports = router;