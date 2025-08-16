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
    enum: ["patient", "doctor", "nurse", "admin", "technician"], // added technician
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
  // New fields for the doctor's editable profile
  qualifications: {
    type: [String], // An array of strings, e.g., ["MBBS", "MD Cardiology"]
  },
  bio: {
    type: String, // A short professional biography
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
  // Optional GeoJSON Polygon that defines where the professional serves.
  // Coordinates must be in [lng, lat] order as per GeoJSON spec.
  serviceArea: {
    type: {
      type: String,
      enum: ["Polygon"],
      required: false,
    },
    coordinates: {
      type: [[[Number]]], // Array of LinearRings: [[ [lng,lat], ... ]]
      required: false,
    },
  },
});

// --- Mongoose Middleware & Hooks ---
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
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

// Create a 2dsphere index for geospatial queries on serviceArea
// Note: Ensure MongoDB version supports 2dsphere on Polygon (it does since 2.4+)
UserSchema.index({ serviceArea: "2dsphere" });
UserSchema.index({ role: 1, city: 1, specialty: 1 });

module.exports = mongoose.model("User", UserSchema);
