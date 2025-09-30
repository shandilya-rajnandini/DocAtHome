const express = require('express');
const { getDemandInsights } = require('../controllers/demandInsightsController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// @route   GET /api/demand-insights
// @access  Private (doctors, nurses)
router.get('/', protect, requireRole(['doctor', 'nurse']), getDemandInsights);

module.exports = router;