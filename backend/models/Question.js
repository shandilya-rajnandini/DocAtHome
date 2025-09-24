const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title for your question"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      minlength: [10, "Title must be at least 10 characters long"],
    },
    body: {
      type: String,
      required: [true, "Please provide a description for your question"],
      trim: true,
      maxlength: [2000, "Question body cannot exceed 2000 characters"],
      minlength: [20, "Question body must be at least 20 characters long"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, "Each tag cannot exceed 30 characters"],
      },
    ],
    category: {
      type: String,
      enum: [
        "general",
        "nutrition",
        "fitness",
        "mental-health",
        "chronic-conditions",
        "women-health",
        "pediatrics",
        "elderly-care",
        "medication",
        "symptoms",
        "prevention",
      ],
      default: "general",
    },
    status: {
      type: String,
      enum: ["open", "answered", "closed"],
      default: "open",
    },
    views: {
      type: Number,
      default: 0,
    },
    upvotes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        upvotedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    downvotes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        downvotedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    answerCount: {
      type: Number,
      default: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    isModerated: {
      type: Boolean,
      default: false,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    moderationReason: {
      type: String,
      maxlength: [500, "Moderation reason cannot exceed 500 characters"],
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for net votes (upvotes - downvotes)
QuestionSchema.virtual("score").get(function () {
  return this.upvotes.length - this.downvotes.length;
});

// Virtual to populate answers count
QuestionSchema.virtual("answers", {
  ref: "Answer",
  localField: "_id",
  foreignField: "question",
  count: true,
});

// Indexes for efficient queries
QuestionSchema.index({ author: 1 });
QuestionSchema.index({ category: 1, isVisible: 1 });
QuestionSchema.index({ status: 1, isVisible: 1 });
QuestionSchema.index({ lastActivity: -1 });
QuestionSchema.index({ views: -1 });
QuestionSchema.index({ createdAt: -1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ "upvotes.user": 1 });
QuestionSchema.index({ "downvotes.user": 1 });

// Text index for search functionality
QuestionSchema.index(
  {
    title: "text",
    body: "text",
    tags: "text",
  },
  {
    weights: {
      title: 10,
      tags: 5,
      body: 1,
    },
  }
);

// Middleware to update lastActivity when question is modified
QuestionSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.lastActivity = new Date();
  }
  next();
});

// Method to increment view count
QuestionSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Method to add upvote
QuestionSchema.methods.addUpvote = function (userId) {
  // Remove any existing downvote
  this.downvotes = this.downvotes.filter(
    (vote) => vote.user.toString() !== userId.toString()
  );

  // Check if user already upvoted
  const existingUpvote = this.upvotes.find(
    (vote) => vote.user.toString() === userId.toString()
  );
  if (existingUpvote) {
    // Remove upvote if already exists
    this.upvotes = this.upvotes.filter(
      (vote) => vote.user.toString() !== userId.toString()
    );
  } else {
    // Add upvote
    this.upvotes.push({ user: userId });
  }

  this.lastActivity = new Date();
  return this.save();
};

// Method to add downvote
QuestionSchema.methods.addDownvote = function (userId) {
  // Remove any existing upvote
  this.upvotes = this.upvotes.filter(
    (vote) => vote.user.toString() !== userId.toString()
  );

  // Check if user already downvoted
  const existingDownvote = this.downvotes.find(
    (vote) => vote.user.toString() === userId.toString()
  );
  if (existingDownvote) {
    // Remove downvote if already exists
    this.downvotes = this.downvotes.filter(
      (vote) => vote.user.toString() !== userId.toString()
    );
  } else {
    // Add downvote
    this.downvotes.push({ user: userId });
  }

  this.lastActivity = new Date();
  return this.save();
};

module.exports = mongoose.model("Question", QuestionSchema);
