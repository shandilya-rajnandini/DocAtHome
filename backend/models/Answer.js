const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: [true, 'Please provide an answer'],
      trim: true,
      maxlength: [3000, 'Answer cannot exceed 3000 characters'],
      minlength: [20, 'Answer must be at least 20 characters long'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    upvotes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
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
          ref: 'User',
        },
        downvotedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isAccepted: {
      type: Boolean,
      default: false,
    },
    acceptedAt: {
      type: Date,
    },
    isModerated: {
      type: Boolean,
      default: false,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    moderationReason: {
      type: String,
      maxlength: [500, 'Moderation reason cannot exceed 500 characters'],
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    // Flag to identify if this answer is from a verified professional
    isVerifiedResponse: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for net votes (upvotes - downvotes)
AnswerSchema.virtual('score').get(function () {
  return this.upvotes.length - this.downvotes.length;
});

// Indexes for efficient queries
AnswerSchema.index({ author: 1 });
AnswerSchema.index({ question: 1, isVisible: 1 });
AnswerSchema.index({ createdAt: -1 });
AnswerSchema.index({ isAccepted: 1 });
AnswerSchema.index({ isVerifiedResponse: 1 });
AnswerSchema.index({ 'upvotes.user': 1 });
AnswerSchema.index({ 'downvotes.user': 1 });

// Compound index for question answers sorted by acceptance and score
AnswerSchema.index({ question: 1, isAccepted: -1, createdAt: -1 });

// Method to add upvote
AnswerSchema.methods.addUpvote = function (userId) {
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

  return this.save();
};

// Method to add downvote
AnswerSchema.methods.addDownvote = function (userId) {
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

  return this.save();
};

// Method to mark as accepted answer
AnswerSchema.methods.markAsAccepted = function () {
  this.isAccepted = true;
  this.acceptedAt = new Date();
  return this.save();
};

// Pre-save middleware to set isVerifiedResponse flag
AnswerSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('author')) {
    try {
      // Check if the author is a verified professional (doctor or nurse)
      const User = mongoose.model('User');
      const author = await User.findById(this.author).select('role isVerified');

      if (
        author &&
        (author.role === 'doctor' || author.role === 'nurse') &&
        author.isVerified
      ) {
        this.isVerifiedResponse = true;
      } else {
        this.isVerifiedResponse = false;
      }
    } catch (error) {
      console.error('Error checking author verification status:', error);
      this.isVerifiedResponse = false;
    }
  }
  next();
});

// Post-save middleware to update question's answer count and last activity
AnswerSchema.post('save', async function () {
  try {
    const Question = mongoose.model('Question');
    const answerCount = await mongoose.model('Answer').countDocuments({
      question: this.question,
      isVisible: true,
    });

    await Question.findByIdAndUpdate(this.question, {
      answerCount,
      lastActivity: new Date(),
      status: answerCount > 0 ? 'answered' : 'open',
    });
  } catch (error) {
    console.error('Error updating question after answer save:', error);
  }
});

// Post-remove middleware to update question's answer count after deletion
AnswerSchema.post('remove', async function () {
  try {
    const Question = mongoose.model('Question');
    const answerCount = await mongoose.model('Answer').countDocuments({
      question: this.question,
      isVisible: true,
    });

    await Question.findByIdAndUpdate(this.question, {
      answerCount,
      lastActivity: new Date(),
      status: answerCount > 0 ? 'answered' : 'open',
    });
  } catch (error) {
    console.error('Error updating question after answer removal:', error);
  }
});

module.exports = mongoose.model('Answer', AnswerSchema);
