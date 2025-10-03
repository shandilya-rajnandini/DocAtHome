/* eslint-disable quotes */
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const speakeasy = require("speakeasy");
const { catchAsync } = require("../utils/controllerFactory");
const {
  AppError,
  ValidationError,
  AuthenticationError,
  ConflictError,
  logger,
} = require("../middleware/errorHandler");
const { performFraudChecks } = require("../utils/fraudDetection");


exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(
      new ValidationError("Please provide name, email, and password")
    );
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });

  if (userExists) {
    return next(new ConflictError("User with this email already exists"));
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || "patient",
  });

  const payload = { user: { id: user.id, role: user.role } };

  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: "5h" },
    (err, token) => {
      if (err) throw err;
      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  );
});


exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return next(new AuthenticationError("User not found"));
  }
  res.json(user);
});


exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return next(new ValidationError("Please provide both email and password"));
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ValidationError("Please provide a valid email address"));
  }

  // Find user - always take same time regardless of user existence (timing attack prevention)
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  // Create a dummy hash for timing attack prevention when user doesn't exist
  const dummyHash =
    "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
  const hashToCompare = user ? user.password : dummyHash;

  // Always perform bcrypt comparison to prevent timing attacks
  const isMatch = await bcrypt.compare(password, hashToCompare);

  // Check if user exists AND password matches
  if (!user || !isMatch) {
    // If user exists but password is wrong, increment login attempts
    if (user && !isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.isLocked = true;
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lock
        await user.save();

        return next(
          new AuthenticationError(
            "Account locked due to too many failed login attempts. Please try again in 30 minutes or reset your password."
          )
        );
      }

      await user.save();
    }

    return next(new AuthenticationError("Invalid credentials"));
  }

  // Check if account is locked
  if (user.isLocked && user.lockUntil > Date.now()) {
    return next(
      new AuthenticationError(
        "Account is temporarily locked. Please try again later or reset your password."
      )
    );
  }

  // Verify the stored password is properly hashed (security check)
  if (!user.password.startsWith("$2a$") && !user.password.startsWith("$2b$")) {
    // This should never happen in production, but protects against hash bypass
    logger.error("SECURITY ALERT: User password is not properly hashed", {
      userEmail: user.email,
      userId: user.id,
    });
    return next(
      new AppError("Authentication system error. Please contact support.", 500)
    );
  }

  // Successful login - clear any locks and reset login attempts
  if (user.isLocked || user.lockUntil || user.loginAttempts > 0) {
    user.isLocked = false;
    user.lockUntil = undefined;
    user.loginAttempts = 0;
    await user.save();
  }

  // Check if 2FA is enabled for this user
  if (user.isTwoFactorEnabled) {
    logger.info("2FA required for user login", {
      userId: user.id,
      email: user.email,
    });
    return res.json({
      twoFactorRequired: true,
      userId: user.id,
      message: "Two-factor authentication required",
    });
  }

  // Generate JWT token for users without 2FA
  const payload = {
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
    },
  };

  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: "5h" },
    (err, token) => {
      if (err) {
        logger.error("JWT signing error", {
          error: err.message,
          userId: user.id,
        });
        return next(
          new AppError("Authentication error. Please try again.", 500)
        );
      }

      logger.info("Successful login", { userId: user.id, email: user.email });
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  );
});

exports.loginWith2FA = catchAsync(async (req, res, next) => {
  const { userId, token } = req.body;

  // Input validation
  if (!userId || !token) {
    return next(new ValidationError("Please provide user ID and 2FA token"));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new AuthenticationError("User not found"));
  }

  if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
    return next(
      new ValidationError(
        "Two-factor authentication is not enabled for this user"
      )
    );
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: token,
    window: 2, // Allow some time drift
  });

  if (!verified) {
    // Increment 2FA attempts to prevent brute force
    user.loginAttempts = (user.loginAttempts || 0) + 1;

    if (user.loginAttempts >= 5) {
      user.isLocked = true;
      user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lock
      await user.save();

      return next(
        new AuthenticationError(
          "Account locked due to too many failed 2FA attempts. Please try again in 30 minutes."
        )
      );
    }

    await user.save();
    return next(new AuthenticationError("Invalid 2FA token"));
  }

  // Successful 2FA - clear any locks and reset login attempts
  if (user.isLocked || user.lockUntil || user.loginAttempts > 0) {
    user.isLocked = false;
    user.lockUntil = undefined;
    user.loginAttempts = 0;
    await user.save();
  }

  const payload = {
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
    },
  };

  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: "5h" },
    (err, token) => {
      if (err) {
        logger.error("JWT signing error after 2FA", {
          error: err.message,
          userId: user.id,
        });
        return next(
          new AppError("Authentication error. Please try again.", 500)
        );
      }

      logger.info("Successful 2FA login", {
        userId: user.id,
        email: user.email,
      });
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  );
});

// Helper function to normalize and validate professional fields
const normalizeAndValidateProfessionalFields = (
  specialty,
  city,
  experience,
  licenseNumber,
  govId,
  role
) => {
  const errors = [];

  // Trim string fields
  const normalizedSpecialty = specialty ? specialty.trim() : "";
  const normalizedCity = city ? city.trim() : "";
  const normalizedLicenseNumber = licenseNumber ? licenseNumber.trim() : "";
  const normalizedGovId = govId ? govId.trim() : "";

  // Validate required fields for doctor/nurse roles
  if (role === "doctor" || role === "nurse") {
    if (!normalizedSpecialty) {
      errors.push("Specialty is required for doctors and nurses");
    }
    if (!normalizedCity) {
      errors.push("City is required for doctors and nurses");
    }
    if (!normalizedLicenseNumber) {
      errors.push("License number is required for doctors and nurses");
    }
    if (!normalizedGovId) {
      errors.push("Government ID is required for doctors and nurses");
    }

    // Coerce and validate experience
    let normalizedExperience;
    if (experience === undefined || experience === null || experience === "") {
      errors.push("Experience is required for doctors and nurses");
    } else {
      normalizedExperience = Number(experience);
      if (isNaN(normalizedExperience)) {
        errors.push("Experience must be a valid number");
      } else if (normalizedExperience < 1) {
        errors.push("Experience must be at least 1 year");
      } else if (normalizedExperience > 50) {
        errors.push("Experience cannot exceed 50 years");
      } else if (!Number.isInteger(normalizedExperience)) {
        errors.push("Experience must be a whole number");
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(
        `Professional field validation failed: ${errors.join(", ")}`
      );
    }

    return {
      specialty: normalizedSpecialty,
      city: normalizedCity,
      experience: normalizedExperience,
      licenseNumber: normalizedLicenseNumber,
      govId: normalizedGovId,
    };
  }

  return null;
};

exports.register = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    password,
    phone,
    role,
    specialty,
    city,
    experience,
    licenseNumber,
    govId,
  } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return next(
      new ValidationError("Please provide name, email, and password")
    );
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ValidationError("Please provide a valid email address"));
  }

  // Password strength validation
  if (password.length < 8) {
    return next(
      new ValidationError("Password must be at least 8 characters long")
    );
  }

  // Check for password complexity
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
    return next(
      new ValidationError(
        "Password must contain at least one uppercase letter, lowercase letter, number, and special character"
      )
    );
  }

  // Check if user already exists
  let user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    return next(new ConflictError("User with this email already exists"));
  }

  // Validate role if provided
  const validRoles = ["patient", "doctor", "nurse", "admin", "technician", "ambulance"];
  if (role && !validRoles.includes(role)) {
    return next(new ValidationError("Invalid role specified"));
  }

  // Create user object with basic fields
  const userData = {
  name: name.trim(),
  email: email.toLowerCase(),
  password, // Will be hashed by the User model pre-save hook
  role: role || "patient",
  };

  // Add phone for professional roles
  if (role === "doctor" || role === "nurse" || role === "technician" || role === "ambulance") {
    if (!phone) {
      return next(new ValidationError("Phone number is required for professional accounts"));
    }
    userData.phone = phone.trim();
  }

  // Add professional fields if role is doctor or nurse
  if (role === "doctor" || role === "nurse") {
    try {
      const professionalFields = normalizeAndValidateProfessionalFields(
        specialty,
        city,
        experience,
        licenseNumber,
        govId,
        role
      );

      // Runtime check to ensure normalized values are valid
      if (!professionalFields) {
        throw new ValidationError("Failed to normalize professional fields");
      }

      // Assign normalized and validated values
      Object.assign(userData, professionalFields);
    } catch (error) {
      return next(error);
    }
  }

  // Add ambulance driver fields if role is ambulance
  if (role === "ambulance") {
    const { driverLicenseNumber, vehicleRegistrationNumber } = req.body;
    if (!driverLicenseNumber || !vehicleRegistrationNumber) {
      return next(new ValidationError("Driver's License No. and Vehicle Registration No. are required for ambulance drivers"));
    }
    userData.driverLicenseNumber = driverLicenseNumber.trim();
    userData.vehicleRegistrationNumber = vehicleRegistrationNumber.trim();
  }

  // Perform fraud detection checks for professional accounts
  if (role === "doctor" || role === "nurse" || role === "technician" || role === "ambulance") {
    try {
      const fraudFlags = await performFraudChecks(userData);
      if (fraudFlags.length > 0) {
        userData.flags = fraudFlags;
        logger.warn(`Fraud flags detected during registration: ${fraudFlags.join(', ')}`, {
          email: userData.email,
          role: userData.role,
          flags: fraudFlags
        });
      }
    } catch (error) {
      logger.error('Fraud detection failed during registration:', error);
      // Continue with registration even if fraud detection fails
    }
  }

  // Create new user
  const newUser = new User(userData);

  await newUser.save();

  // Create JWT token
  const payload = {
    user: {
      id: newUser.id,
      role: newUser.role,
      email: newUser.email,
    },
  };

  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: "5h" },
    (err, token) => {
      if (err) {
        logger.error("JWT signing error during registration", {
          error: err.message,
          userId: newUser.id,
        });
        return next(
          new AppError(
            "Registration successful but token generation failed. Please login.",
            500
          )
        );
      }

      res.status(201).json({
        success: true,
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    }
  );
});
exports.getMe = catchAsync(async (req, res, _next) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }
  res.json(user);
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = catchAsync(async (req, res, _next) => {
  const { email } = req.body;

  // Input validation
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide email address",
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // Don't reveal if user exists or not (security best practice)
  // Always return success message to prevent email enumeration
  if (!user) {
    return res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent",
    });
  }

  // Check if user recently requested password reset (prevent spam)
  const lastResetAttempt = user.passwordResetExpires || 0;
  const timeSinceLastReset = Date.now() - (lastResetAttempt - 10 * 60 * 1000);

  if (timeSinceLastReset < 5 * 60 * 1000) {
    // 5 minutes cooldown
    return res.status(429).json({
      success: false,
      message: "Please wait before requesting another password reset",
    });
  }

  // Generate cryptographically secure token
  const resetToken = crypto.randomBytes(32).toString("hex"); // Increased from 20 to 32 bytes

  // Hash token and set to user
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire time to 10 minutes (short window for security)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  // Create reset URL
  const resetUrl = `${
    process.env.FRONTEND_URL || "http://localhost:5173"
  }/reset-password/${resetToken}`;

  const message = `
    Hello ${user.name},
    
    You have requested a password reset for your DocAtHome account.
    
    Please click the link below to reset your password:
    ${resetUrl}
    
    This link will expire in 10 minutes for security reasons.
    
    If you didn't request this password reset, please ignore this email.
    
    Best regards,
    DocAtHome Team
    `;

  try {
    await sendEmail({
      email: user.email,
      subject: "DocAtHome - Password Reset Request",
      message,
    });

    res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent",
    });
  } catch (err) {
    console.error("Email service error:", err.message);

    // Clean up reset token if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(500).json({
      success: false,
      message: "Email service temporarily unavailable. Please try again later.",
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = catchAsync(async (req, res, _next) => {
  const { password } = req.body;
  const { token } = req.params;

  // Input validation
  if (!password || !token) {
    return res.status(400).json({
      success: false,
      message: "Password and token are required",
    });
  }

  // Password strength validation (same as registration)
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must contain at least one uppercase letter, lowercase letter, number, and special character",
    });
  }

  // Validate token format (hex string)
  if (!/^[a-f0-9]+$/i.test(token) || token.length !== 64) {
    return res.status(400).json({
      success: false,
      message: "Invalid reset token format",
    });
  }

  // Get hashed token
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }

  // Verify user account is active/not locked
  if (user.isLocked && user.lockUntil > Date.now()) {
    return res.status(423).json({
      success: false,
      message: "Account is temporarily locked. Please try again later.",
    });
  }

  // Set new password (will be hashed by pre-save hook)
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Clear any account locks since user successfully reset password
  user.isLocked = false;
  user.lockUntil = undefined;
  user.loginAttempts = 0;

  await user.save();

  // Log security event (password reset successful)
  console.info(`Password reset successful for user: ${user.email}`);

  res.status(200).json({
    success: true,
    message:
      "Password has been reset successfully. You can now login with your new password.",
  });
});
