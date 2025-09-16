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
const { validateObjectId } = require('../middleware/validation');

// Patient routes
router.post('/', protect, requireRole(['patient']), createSecondOpinion);
router.get('/my-requests', protect, requireRole(['patient']), getMySecondOpinions);
router.post('/:id/upload', protect, validateObjectId('id'), secondOpinionUpload.array('files', 20), uploadSecondOpinionFiles);
router.get('/:id/files', protect, validateObjectId('id'), getSecondOpinionFiles);
router.post('/:id/payment', protect, requireRole(['patient']), validateObjectId('id'), createSecondOpinionPayment);
router.post('/:id/payment/verify', protect, requireRole(['patient']), validateObjectId('id'), verifySecondOpinionPayment);

// Doctor routes
router.get('/available', protect, requireRole(['doctor']), getAvailableSecondOpinions);
router.put('/:id/assign', protect, requireRole(['doctor']), validateObjectId('id'), assignSecondOpinion);
router.post('/:id/video-response', protect, requireRole(['doctor']), validateObjectId('id'), videoResponseUpload.single('video'), uploadVideoResponse);

// Error handling middleware for multer
router.use(handleMulterError);

module.exports = router;