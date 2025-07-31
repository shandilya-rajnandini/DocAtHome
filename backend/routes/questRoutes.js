const express = require('express');
const router = express.Router();
const {
  getQuests,
  acceptQuest,
  logQuestProgress,
} = require('../controllers/questController');
const { protect } = require('../middleware/authMiddleware');

// All routes in this file are protected and require a user to be logged in.
router.use(protect);

router.route('/').get(getQuests);
router.route('/:questId/accept').post(acceptQuest);
router.route('/:userQuestId/log').post(logQuestProgress);

module.exports = router;
