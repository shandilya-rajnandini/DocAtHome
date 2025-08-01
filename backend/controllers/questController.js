const Quest = require('../models/Quest');
const UserQuest = require('../models/UserQuest');
const User = require('../models/User');

// @desc    Get all quests and user's progress
// @route   GET /api/quests
exports.getQuests = async (req, res) => {
  try {
    const quests = await Quest.find().lean();
    const userQuests = await UserQuest.find({ user: req.user.id });

    const questsWithProgress = quests.map(quest => {
      const userQuest = userQuests.find(uq => uq.quest.toString() === quest._id.toString());
      return {
        ...quest,
        userQuestId: userQuest ? userQuest._id : null,
        progress: userQuest ? userQuest.progress : 0,
        status: userQuest ? userQuest.status : 'not-started',
      };
    });

    res.status(200).json({ success: true, data: questsWithProgress });
  } catch (err) {
    console.error('GET QUESTS ERROR:', err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Accept a quest
// @route   POST /api/quests/:questId/accept
exports.acceptQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.questId);
    if (!quest) {
      return res.status(404).json({ msg: 'Quest not found' });
    }

    // Check if user has already started this quest
    const existingUserQuest = await UserQuest.findOne({ user: req.user.id, quest: req.params.questId });
    if (existingUserQuest) {
      return res.status(400).json({ msg: 'Quest already accepted' });
    }

    const userQuest = await UserQuest.create({
      user: req.user.id,
      quest: req.params.questId,
      status: 'in-progress',
      startedAt: Date.now(),
    });

    res.status(201).json({ success: true, data: userQuest });
  } catch (err) {
    console.error('ACCEPT QUEST ERROR:', err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Log progress for a quest
// @route   POST /api/quests/:userQuestId/log
exports.logQuestProgress = async (req, res) => {
  try {
    const userQuest = await UserQuest.findById(req.params.userQuestId).populate('quest');
    if (!userQuest) {
      return res.status(404).json({ msg: 'User quest not found' });
    }

    // Authorization check
    if (userQuest.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    if (userQuest.status === 'completed') {
      return res.status(400).json({ msg: 'Quest already completed' });
    }

    // Logic to prevent logging more than once a day
// Logic to prevent logging more than once a day (UTC-based)
const today = new Date();
const todayUTC = new Date(Date.UTC(
  today.getUTCFullYear(),
  today.getUTCMonth(),
  today.getUTCDate()
));

if (userQuest.lastLoggedDate) {
  const lastLoggedUTC = new Date(Date.UTC(
    userQuest.lastLoggedDate.getUTCFullYear(),
    userQuest.lastLoggedDate.getUTCMonth(),
    userQuest.lastLoggedDate.getUTCDate()
  ));

  if (lastLoggedUTC.getTime() === todayUTC.getTime()) {
    return res.status(400).json({ msg: 'Progress already logged for today' });
  }
}

    userQuest.progress += 1;
    userQuest.lastLoggedDate = new Date();

    // Check for completion
    if (userQuest.progress >= userQuest.quest.durationDays && userQuest.status !== 'completed') {
      userQuest.status = 'completed';
      userQuest.completedAt = new Date();
      
      // Use atomic operations to prevent race conditions
      const [savedUserQuest, updatedUser] = await Promise.all([
        userQuest.save(),
        User.findByIdAndUpdate(
          req.user.id,
          { $inc: { healthPoints: userQuest.quest.points } },
          { new: true }
        )
      ]);
      
      return res.status(200).json({ success: true, data: savedUserQuest });
    }

    const savedUserQuest = await userQuest.save();

    res.status(200).json({ success: true, data: savedUserQuest });
  } catch (err) {
    console.error('LOG PROGRESS ERROR:', err.message);
    res.status(500).send('Server Error');
  }
};
