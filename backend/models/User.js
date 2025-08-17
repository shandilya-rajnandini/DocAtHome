const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["patient", "doctor", "nurse", "admin", "technician"],
    default: "patient",
  },

  // --- Professional Details ---
  specialty: {
    type: String,
    required: function () {
      return this.role === "doctor" || this.role === "nurse";
    },
  },
  city: {
    type: String,
    required: function () {
      return this.role === "doctor" || this.role === "nurse";
    },
  },
  experience: {
    type: Number,
    required: function () {
      return this.role === "doctor" || this.role === "nurse";
    },
  },
  qualifications: {
    type: [String],
  },
  bio: {
    type: String,
  },
  licenseNumber: {
    type: String,
    required: function () {
      return this.role === "doctor" || this.role === "nurse";
    },
  },
  govId: {
    type: String,
    required: function () {
      return this.role === "doctor" || this.role === "nurse";
    },
  },
  certificationId: {
    type: String,
    required: function () {
      return this.role === "technician";
    },
  },

  // --- Patient-Specific Medical Info ---
  allergies: {
    type: [String],
    default: [],
  },
  chronicConditions: {
    type: [String],
    default: [],
  },
  careFundBalance: {
    type: Number,
    default: 0,
  },

  // --- Status & Ratings ---
  isVerified: {
    type: Boolean,
    default: false,
  },
  averageRating: {
    type: Number,
    max: [5, "Rating must not be more than 5"],
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  profilePictureUrl: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // --- Password Reset Fields ---
  passwordResetToken: String,
  passwordResetExpires: Date,

  // --- Account Security Fields ---
  isLocked: {
    type: Boolean,
    default: false,
  },
  lockUntil: Date,
  loginAttempts: {
    type: Number,
    default: 0,
  },

  // --- Gamification Fields ---
  healthPoints: {
    type: Number,
    default: 0,
  },
  twoFactorSecret: {
    type: String,
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false,
  },

  // --- Geofencing: Professional Service Area ---
  serviceArea: {
    type: {
      type: String,
      enum: ["Polygon"],
      required: false,
    },
    coordinates: {
      type: [[[Number]]],
      required: false,
    },
  },

  // --- Subscription ---
  razorpaySubscriptionId: {
    type: String,
    required: false,
  },
});

// --- Mongoose Middleware & Hooks ---
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.pre("save", function (next) {
  if (this.role === "admin" && this.isNew) {
    this.isVerified = true;
  }
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- Indexes ---
// Geospatial index
UserSchema.index({ serviceArea: "2dsphere" });

// Multi-field query index
UserSchema.index({ role: 1, city: 1, specialty: 1 });

// Unique subscription index (from main branch)
UserSchema.index(
  { razorpaySubscriptionId: 1 },
  { unique: true, partialFilterExpression: { razorpaySubscriptionId: { $exists: true } } }
);

module.exports = mongoose.model("User", UserSchema);
