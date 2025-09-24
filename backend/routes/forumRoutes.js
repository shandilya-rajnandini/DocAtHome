const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestion,
  createQuestion,
  createAnswer,
  voteQuestion,
  voteAnswer,
  acceptAnswer,
} = require('../controllers/forumController');

const { protect } = require('../middleware/authMiddleware');
const {
  validate,
  validateObjectId,
  forumSchemas,
  limitRequestSize,
  detectXSS,
} = require('../middleware/validation');

// Apply comprehensive security middleware to all forum routes
router.use(limitRequestSize);
router.use(detectXSS);

// Public routes - anyone can view questions and answers
// GET /api/forum/questions - Get all questions with filters and pagination
router
  .route('/questions')
  .get(getQuestions)
  .post(protect, validate(forumSchemas.createQuestion), createQuestion);

// GET /api/forum/questions/:questionId - Get a specific question with answers
router
  .route('/questions/:questionId')
  .get(validateObjectId('questionId'), getQuestion);

// Protected routes - require authentication
// POST /api/forum/questions/:questionId/answers - Create an answer
router
  .route('/questions/:questionId/answers')
  .post(
    protect,
    validateObjectId('questionId'),
    validate(forumSchemas.createAnswer),
    createAnswer
  );

// POST /api/forum/questions/:questionId/vote - Vote on a question
router
  .route('/questions/:questionId/vote')
  .post(
    protect,
    validateObjectId('questionId'),
    validate(forumSchemas.voteQuestion),
    voteQuestion
  );

// POST /api/forum/answers/:answerId/vote - Vote on an answer
router
  .route('/answers/:answerId/vote')
  .post(
    protect,
    validateObjectId('answerId'),
    validate(forumSchemas.voteAnswer),
    voteAnswer
  );

// POST /api/forum/answers/:answerId/accept - Accept an answer (question author only)
router
  .route('/answers/:answerId/accept')
  .post(protect, validateObjectId('answerId'), acceptAnswer);

module.exports = router;
