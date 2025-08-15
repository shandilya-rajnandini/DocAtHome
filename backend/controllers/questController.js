const Quest = require('../models/Quest');
const UserQuest = require('../models/UserQuest');
const User = require('../models/User');
const { 
  catchAsync, 
  _AppError, 
  ValidationError, 
  NotFoundError,
  ConflictError,
  _RateLimitError 
} = require('../middleware/errorHandler');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all quests and user's progress
// @route   GET /api/quests
exports.getQuests = catchAsync(async (req, res, _next) => {
  const userId = req.user.id;

  // Use aggregation pipeline for better performance and atomicity
  const [quests, userQuests] = await Promise.all([
    Quest.find({ isActive: { $ne: false } }) // Only get active quests
      .select('title description points durationDays category')
      .lean(),
    UserQuest.find({ user: userId })
      .select('quest progress status startedAt completedAt lastLoggedDate')
      .lean()
  ]);

  // Create a Map for O(1) lookup performance
  const userQuestMap = new Map(
    userQuests.map(uq => [uq.quest.toString(), uq])
  );

  const questsWithProgress = quests.map(quest => {
    const userQuest = userQuestMap.get(quest._id.toString());
    
    return {
      ...quest,
      userQuestId: userQuest?._id || null,
      progress: userQuest?.progress || 0,
      status: userQuest?.status || 'not-started',
      startedAt: userQuest?.startedAt || null,
      completedAt: userQuest?.completedAt || null,
      lastLoggedDate: userQuest?.lastLoggedDate || null,
      canLogToday: userQuest ? canLogProgressToday(userQuest.lastLoggedDate) : false
    };
  });

  res.status(200).json({ 
    success: true, 
    data: questsWithProgress,
    totalQuests: quests.length,
    activeQuests: userQuests.filter(uq => uq.status === 'in-progress').length,
    completedQuests: userQuests.filter(uq => uq.status === 'completed').length
  });
});

// Helper function to check if user can log progress today
function canLogProgressToday(lastLoggedDate) {
  if (!lastLoggedDate) return true;
  
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  
  const lastLogged = new Date(lastLoggedDate);
  lastLogged.setUTCHours(0, 0, 0, 0);
  
  return lastLogged.getTime() < today.getTime();
}

// @desc    Accept a quest
// @route   POST /api/quests/:questId/accept
exports.acceptQuest = catchAsync(async (req, res, next) => {
  const { questId } = req.params;
  const userId = req.user.id;

  // Validate quest ID format
  if (!questId.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new ValidationError('Invalid quest ID format'));
  }

  const quest = await Quest.findById(questId);
  if (!quest) {
    return next(new NotFoundError('Quest not found'));
  }

  // Use atomic operation to prevent race condition
  // This will either create a new UserQuest or fail if one already exists
  try {
    const userQuest = await UserQuest.create({
      user: userId,
      quest: questId,
      status: 'in-progress',
      startedAt: new Date(),
      progress: 0,
      lastLoggedDate: null,
    });

    res.status(201).json({ 
      success: true, 
      data: userQuest,
      message: 'Quest accepted successfully'
    });
  } catch (createError) {
    // Check if it's a duplicate key error (MongoDB error code 11000)
    if (createError.code === 11000) {
      return next(new ConflictError('Quest already accepted by user'));
    }
    
    // Re-throw if it's a different error
    throw createError;
  }
});

// @desc    Log progress for a quest
// @route   POST /api/quests/:userQuestId/log
exports.logQuestProgress = asyncHandler(async (req, res) => {
    const { userQuestId } = req.params;
    const userId = req.user.id;

    // Validate userQuest ID format
    if (!userQuestId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user quest ID format' 
      });
    }

    // Get current UTC date for consistent daily tracking
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    // Use atomic findOneAndUpdate to prevent race conditions
    // This operation is atomic and will prevent multiple simultaneous updates
    const updateResult = await UserQuest.findOneAndUpdate(
      {
        _id: userQuestId,
        user: userId,
        status: { $ne: 'completed' }, // Only allow updates if not completed
        $or: [
          { lastLoggedDate: { $exists: false } }, // Never logged before
          { lastLoggedDate: null }, // Explicitly null
          { lastLoggedDate: { $lt: todayUTC } } // Last logged before today
        ]
      },
      {
        $inc: { progress: 1 }, // Atomic increment
        $set: { lastLoggedDate: new Date() } // Set current timestamp
      },
      { 
        new: true, // Return updated document
        populate: {
          path: 'quest',
          select: 'durationDays points title'
        }
      }
    );

    if (!updateResult) {
      // Check if quest exists but conditions weren't met
      const existingQuest = await UserQuest.findOne({ 
        _id: userQuestId, 
        user: userId 
      }).populate('quest');

      if (!existingQuest) {
        return res.status(404).json({ 
          success: false,
          message: 'Quest not found or you do not have access to it' 
        });
      }

      if (existingQuest.status === 'completed') {
        return res.status(400).json({ 
          success: false,
          message: 'Quest already completed' 
        });
      }

      // If we get here, user already logged progress today
      return res.status(429).json({ 
        success: false,
        message: 'Progress already logged for today. Please try again tomorrow.' 
      });
    }

    // Check if quest should be completed (race-condition safe)
    if (updateResult.progress >= updateResult.quest.durationDays && updateResult.status !== 'completed') {
      
      // Use atomic operation to complete quest and award points simultaneously
      const completionResult = await Promise.all([
        UserQuest.findByIdAndUpdate(
          userQuestId,
          {
            status: 'completed',
            completedAt: new Date()
          },
          { new: true, populate: { path: 'quest' } }
        ),
        User.findByIdAndUpdate(
          userId,
          { $inc: { healthPoints: updateResult.quest.points } },
          { new: true, select: 'healthPoints' }
        )
      ]);

      const [completedQuest, updatedUser] = completionResult;

      return res.status(200).json({ 
        success: true, 
        data: completedQuest,
        message: `Congratulations! Quest completed! You earned ${updateResult.quest.points} health points.`,
        newHealthPoints: updatedUser.healthPoints
      });
    }

    res.status(200).json({ 
      success: true, 
      data: updateResult,
      message: 'Progress logged successfully',
      progressRemaining: updateResult.quest.durationDays - updateResult.progress
    });
});
