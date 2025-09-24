const Question = require("../models/Question");
const Answer = require("../models/Answer");
const User = require("../models/User");
const Notification = require("../models/Notification");
const socketManager = require("../utils/socketManager");

const {
  catchAsync,
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
} = require("../middleware/errorHandler");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Get all questions with pagination and filtering
// @route   GET /api/forum/questions
// @access  Public
exports.getQuestions = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    category,
    status,
    sortBy = "recent",
    search,
    tags,
  } = req.query;

  // Build filter object
  const filter = { isVisible: true };

  if (category && category !== "all") {
    filter.category = category;
  }

  if (status && status !== "all") {
    filter.status = status;
  }

  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : tags.split(",");
    filter.tags = { $in: tagArray.map((tag) => tag.trim().toLowerCase()) };
  }

  // Build search query
  if (search && search.trim()) {
    filter.$text = { $search: search.trim() };
  }

  // Build sort object
  let sortOptions = {};
  switch (sortBy) {
    case "recent":
      sortOptions = { lastActivity: -1 };
      break;
    case "oldest":
      sortOptions = { createdAt: 1 };
      break;
    case "most-viewed":
      sortOptions = { views: -1 };
      break;
    case "most-answers":
      sortOptions = { answerCount: -1 };
      break;
    case "unanswered":
      filter.answerCount = 0;
      sortOptions = { createdAt: -1 };
      break;
    default:
      sortOptions = { lastActivity: -1 };
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const pageLimit = Math.min(parseInt(limit), 50); // Max 50 questions per page

  try {
    // Execute queries in parallel for better performance
    const [questions, totalCount] = await Promise.all([
      Question.find(filter)
        .populate("author", "name role isVerified profilePictureUrl specialty")
        .select("-upvotes -downvotes") // Exclude vote details for list view
        .sort(sortOptions)
        .skip(skip)
        .limit(pageLimit)
        .lean(),
      Question.countDocuments(filter),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageLimit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Add computed fields to questions
    const enrichedQuestions = questions.map((question) => ({
      ...question,
      timeAgo: getTimeAgo(question.createdAt),
      lastActivityAgo: getTimeAgo(question.lastActivity),
    }));

    res.status(200).json({
      success: true,
      data: {
        questions: enrichedQuestions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: pageLimit,
        },
        filters: {
          category: category || "all",
          status: status || "all",
          sortBy,
          search: search || "",
          tags: tags || [],
        },
      },
      message: `Found ${totalCount} question${totalCount !== 1 ? "s" : ""}`,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return next(new AppError("Failed to fetch questions", 500));
  }
});

// @desc    Get a single question with its answers
// @route   GET /api/forum/questions/:questionId
// @access  Public
exports.getQuestion = catchAsync(async (req, res, next) => {
  const { questionId } = req.params;
  const userId = req.user?.id;

  try {
    // Find the question and increment views
    const question = await Question.findById(questionId)
      .populate(
        "author",
        "name role isVerified profilePictureUrl specialty experience city"
      )
      .lean();

    if (!question || !question.isVisible) {
      return next(new NotFoundError("Question not found"));
    }

    // Increment view count (fire and forget)
    Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } }).exec();

    // Get answers for this question
    const answers = await Answer.find({
      question: questionId,
      isVisible: true,
    })
      .populate(
        "author",
        "name role isVerified profilePictureUrl specialty experience city"
      )
      .sort({ isAccepted: -1, createdAt: -1 }) // Accepted answers first, then by creation time
      .lean();

    // Add computed fields and user interaction status
    const enrichedQuestion = {
      ...question,
      timeAgo: getTimeAgo(question.createdAt),
      lastActivityAgo: getTimeAgo(question.lastActivity),
      score: question.upvotes?.length - question.downvotes?.length || 0,
      userVote: userId ? getUserVote(question, userId) : null,
      canEdit: userId && question.author._id.toString() === userId,
      canDelete:
        userId &&
        (question.author._id.toString() === userId ||
          req.user?.role === "admin"),
    };

    const enrichedAnswers = answers.map((answer) => ({
      ...answer,
      timeAgo: getTimeAgo(answer.createdAt),
      score: answer.upvotes?.length - answer.downvotes?.length || 0,
      userVote: userId ? getUserVote(answer, userId) : null,
      canEdit: userId && answer.author._id.toString() === userId,
      canDelete:
        userId &&
        (answer.author._id.toString() === userId || req.user?.role === "admin"),
      canAccept:
        userId &&
        question.author._id.toString() === userId &&
        !answer.isAccepted,
    }));

    res.status(200).json({
      success: true,
      data: {
        question: enrichedQuestion,
        answers: enrichedAnswers,
        stats: {
          totalAnswers: answers.length,
          verifiedAnswers: answers.filter((a) => a.isVerifiedResponse).length,
          acceptedAnswers: answers.filter((a) => a.isAccepted).length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return next(new AppError("Failed to fetch question", 500));
  }
});

// @desc    Create a new question
// @route   POST /api/forum/questions
// @access  Private
exports.createQuestion = catchAsync(async (req, res, next) => {
  const { title, body, tags, category } = req.body;
  const userId = req.user.id;

  try {
    // Create the question
    const question = await Question.create({
      title: title.trim(),
      body: body.trim(),
      author: userId,
      tags: tags ? tags.map((tag) => tag.trim().toLowerCase()) : [],
      category: category || "general",
    });

    // Populate author details for response
    const populatedQuestion = await Question.findById(question._id)
      .populate("author", "name role isVerified profilePictureUrl specialty")
      .lean();

    // Send notification to verified professionals in relevant specialty (async)
    if (category !== "general") {
      notifyRelevantProfessionals(question._id, category, title).catch(
        (error) => {
          console.error("Error sending notifications to professionals:", error);
        }
      );
    }

    res.status(201).json({
      success: true,
      data: {
        ...populatedQuestion,
        timeAgo: getTimeAgo(populatedQuestion.createdAt),
        score: 0,
        userVote: null,
      },
      message: "Question posted successfully",
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return next(new AppError("Failed to create question", 500));
  }
});

// @desc    Create an answer for a question
// @route   POST /api/forum/questions/:questionId/answers
// @access  Private
exports.createAnswer = catchAsync(async (req, res, next) => {
  const { questionId } = req.params;
  const { body } = req.body;
  const userId = req.user.id;

  try {
    // Check if question exists and is open
    const question = await Question.findById(questionId).select(
      "status author title isVisible"
    );

    if (!question || !question.isVisible) {
      return next(new NotFoundError("Question not found"));
    }

    if (question.status === "closed") {
      return next(
        new ValidationError("This question is closed for new answers")
      );
    }

    // Create the answer
    const answer = await Answer.create({
      body: body.trim(),
      author: userId,
      question: questionId,
    });

    // Populate author details for response
    const populatedAnswer = await Answer.findById(answer._id)
      .populate(
        "author",
        "name role isVerified profilePictureUrl specialty experience city"
      )
      .lean();

    // Send notification to question author (async)
    if (question.author.toString() !== userId) {
      const authorUser = await User.findById(question.author).select("name");

      await Notification.create({
        userId: question.author,
        message: `${req.user.name} answered your question "${question.title}"`,
        link: `/forum/question/${questionId}`,
        isRead: false,
      });

      // Emit real-time notification
      socketManager.emitToRoom(question.author.toString(), "new_notification", {
        message: `${req.user.name} answered your question "${question.title}"`,
        link: `/forum/question/${questionId}`,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        ...populatedAnswer,
        timeAgo: getTimeAgo(populatedAnswer.createdAt),
        score: 0,
        userVote: null,
        canEdit: true,
        canDelete: true,
        canAccept: false,
      },
      message: "Answer posted successfully",
    });
  } catch (error) {
    console.error("Error creating answer:", error);
    return next(new AppError("Failed to create answer", 500));
  }
});

// @desc    Vote on a question
// @route   POST /api/forum/questions/:questionId/vote
// @access  Private
exports.voteQuestion = catchAsync(async (req, res, next) => {
  const { questionId } = req.params;
  const { voteType } = req.body;
  const userId = req.user.id;

  try {
    const question = await Question.findById(questionId);

    if (!question || !question.isVisible) {
      return next(new NotFoundError("Question not found"));
    }

    // Prevent users from voting on their own questions
    if (question.author.toString() === userId) {
      return next(new ValidationError("You cannot vote on your own question"));
    }

    // Apply the vote
    if (voteType === "upvote") {
      await question.addUpvote(userId);
    } else if (voteType === "downvote") {
      await question.addDownvote(userId);
    }

    // Refresh question data
    const updatedQuestion = await Question.findById(questionId)
      .select("upvotes downvotes")
      .lean();

    const score =
      updatedQuestion.upvotes.length - updatedQuestion.downvotes.length;
    const userVote = getUserVote(updatedQuestion, userId);

    res.status(200).json({
      success: true,
      data: {
        score,
        userVote,
      },
      message: `Question ${voteType}d successfully`,
    });
  } catch (error) {
    console.error("Error voting on question:", error);
    return next(new AppError("Failed to vote on question", 500));
  }
});

// @desc    Vote on an answer
// @route   POST /api/forum/answers/:answerId/vote
// @access  Private
exports.voteAnswer = catchAsync(async (req, res, next) => {
  const { answerId } = req.params;
  const { voteType } = req.body;
  const userId = req.user.id;

  try {
    const answer = await Answer.findById(answerId);

    if (!answer || !answer.isVisible) {
      return next(new NotFoundError("Answer not found"));
    }

    // Prevent users from voting on their own answers
    if (answer.author.toString() === userId) {
      return next(new ValidationError("You cannot vote on your own answer"));
    }

    // Apply the vote
    if (voteType === "upvote") {
      await answer.addUpvote(userId);
    } else if (voteType === "downvote") {
      await answer.addDownvote(userId);
    }

    // Refresh answer data
    const updatedAnswer = await Answer.findById(answerId)
      .select("upvotes downvotes")
      .lean();

    const score = updatedAnswer.upvotes.length - updatedAnswer.downvotes.length;
    const userVote = getUserVote(updatedAnswer, userId);

    res.status(200).json({
      success: true,
      data: {
        score,
        userVote,
      },
      message: `Answer ${voteType}d successfully`,
    });
  } catch (error) {
    console.error("Error voting on answer:", error);
    return next(new AppError("Failed to vote on answer", 500));
  }
});

// @desc    Accept an answer (question author only)
// @route   POST /api/forum/answers/:answerId/accept
// @access  Private
exports.acceptAnswer = catchAsync(async (req, res, next) => {
  const { answerId } = req.params;
  const userId = req.user.id;

  try {
    const answer = await Answer.findById(answerId)
      .populate("question", "author status")
      .populate("author", "name");

    if (!answer || !answer.isVisible) {
      return next(new NotFoundError("Answer not found"));
    }

    // Only question author can accept answers
    if (answer.question.author.toString() !== userId) {
      return next(
        new ValidationError("Only the question author can accept answers")
      );
    }

    // Check if question is still open for acceptance
    if (answer.question.status === "closed") {
      return next(new ValidationError("This question is closed"));
    }

    // Unaccept any previously accepted answers for this question
    await Answer.updateMany(
      { question: answer.question._id, isAccepted: true },
      { isAccepted: false, acceptedAt: null }
    );

    // Accept this answer
    await answer.markAsAccepted();

    // Update question status to answered
    await Question.findByIdAndUpdate(answer.question._id, {
      status: "answered",
      lastActivity: new Date(),
    });

    // Send notification to answer author (async)
    if (answer.author._id.toString() !== userId) {
      await Notification.create({
        userId: answer.author._id,
        message: `Your answer has been accepted by ${req.user.name}`,
        link: `/forum/question/${answer.question._id}`,
        isRead: false,
      });

      // Emit real-time notification
      socketManager.emitToRoom(
        answer.author._id.toString(),
        "new_notification",
        {
          message: `Your answer has been accepted by ${req.user.name}`,
          link: `/forum/question/${answer.question._id}`,
        }
      );
    }

    res.status(200).json({
      success: true,
      data: {
        isAccepted: true,
        acceptedAt: answer.acceptedAt,
      },
      message: "Answer accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting answer:", error);
    return next(new AppError("Failed to accept answer", 500));
  }
});

// Helper function to get time ago string
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else {
    return new Date(date).toLocaleDateString();
  }
}

// Helper function to get user's vote on a question/answer
function getUserVote(item, userId) {
  if (!item.upvotes || !item.downvotes) return null;

  const hasUpvoted = item.upvotes.some(
    (vote) => vote.user.toString() === userId
  );
  const hasDownvoted = item.downvotes.some(
    (vote) => vote.user.toString() === userId
  );

  if (hasUpvoted) return "upvote";
  if (hasDownvoted) return "downvote";
  return null;
}

// Helper function to notify relevant professionals
async function notifyRelevantProfessionals(questionId, category, title) {
  try {
    // Map categories to specialties
    const categorySpecialtyMap = {
      nutrition: ["Nutritionist", "Dietitian"],
      "mental-health": ["Psychiatrist", "Psychologist"],
      "chronic-conditions": ["Internal Medicine", "Family Medicine"],
      "women-health": ["Gynecologist", "Obstetrician"],
      pediatrics: ["Pediatrician"],
      "elderly-care": ["Geriatrician", "Family Medicine"],
    };

    const relevantSpecialties = categorySpecialtyMap[category] || [];

    if (relevantSpecialties.length > 0) {
      // Find verified professionals with relevant specialties
      const professionals = await User.find({
        role: { $in: ["doctor", "nurse"] },
        isVerified: true,
        specialty: { $in: relevantSpecialties },
      })
        .select("_id name")
        .limit(10); // Limit to avoid spam

      // Create notifications for each professional
      const notifications = professionals.map((prof) => ({
        userId: prof._id,
        message: `New question in ${category}: "${title}"`,
        link: `/forum/question/${questionId}`,
        isRead: false,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);

        // Send real-time notifications
        professionals.forEach((prof) => {
          socketManager.emitToRoom(prof._id.toString(), "new_notification", {
            message: `New question in ${category}: "${title}"`,
            link: `/forum/question/${questionId}`,
          });
        });
      }
    }
  } catch (error) {
    console.error("Error notifying professionals:", error);
  }
}
