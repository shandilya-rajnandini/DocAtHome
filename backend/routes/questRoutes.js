const express = require('express');
const router = express.Router();
const {
  getQuests,
  acceptQuest,
  logQuestProgress,
} = require('../controllers/questController');
const { protect } = require('../middleware/authMiddleware');
const { 
  validate, 
  validateObjectId, 
  questSchemas, 
  limitRequestSize, 
  detectXSS 
} = require('../middleware/validation');

// Apply comprehensive security middleware to all quest routes
router.use(limitRequestSize);
router.use(detectXSS);

// All routes in this file are protected and require a user to be logged in.
router.use(protect);

// GET /api/quests - Get all available quests
router.route('/').get(getQuests);

// POST /api/quests/:questId/accept - Accept a quest with ID validation
router.route('/:questId/accept')
    .post(validateObjectId('questId'), acceptQuest);

// POST /api/quests/:userQuestId/log - Log quest progress with comprehensive validation
router.route('/:userQuestId/log')
    .post(validateObjectId('userQuestId'), 
          validate(questSchemas.progress), 
          logQuestProgress);

module.exports = router;
