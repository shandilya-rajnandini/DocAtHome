/* eslint-disable quotes */
/**
 * Example showing before and after refactoring with controllerFactory
 *
 * This file demonstrates how to migrate from manual try-catch blocks
 * to using the controller factory pattern.
 */

// ========== BEFORE (with manual try-catch) ==========

const beforeRefactor = {
  // Old way - lots of repetitive try-catch code
  createDoctor: async (req, res) => {
    try {
      const { name, email, specialty } = req.body;

      if (!name || !email || !specialty) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields",
        });
      }

      const doctor = await User.create({
        name,
        email,
        specialty,
        role: "doctor",
      });

      res.status(201).json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      console.error("Error creating doctor:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },

  getDoctorById: async (req, res) => {
    try {
      const doctor = await User.findById(req.params.id);

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      console.error("Error fetching doctor:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
};

// ========== AFTER (with controller factory) ==========

const { catchAsync, getOne } = require("../utils/controllerFactory");
const { ValidationError } = require("../middleware/errorHandler");
const User = require("../models/User");

const afterRefactor = {
  // New way - clean and concise with automatic error handling
  createDoctor: catchAsync(async (req, res, next) => {
    const { name, email, specialty } = req.body;

    // Input validation - errors are automatically caught and handled
    if (!name || !email || !specialty) {
      return next(new ValidationError("Please provide all required fields"));
    }

    const doctor = await User.create({
      name,
      email,
      specialty,
      role: "doctor",
    });

    res.status(201).json({
      success: true,
      data: doctor,
    });
    // No try-catch needed! catchAsync handles any errors automatically
  }),

  // Even simpler - use the generic factory function
  getDoctorById: getOne(User),

  // Or use catchAsync for custom logic
  getDoctorByIdCustom: catchAsync(async (req, res, next) => {
    const doctor = await User.findById(req.params.id);

    if (!doctor) {
      const { NotFoundError } = require("../middleware/errorHandler");
      return next(new NotFoundError("Doctor not found"));
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  }),
};

// ========== MIGRATION STEPS ==========

/**
 * Steps to refactor your controllers:
 *
 * 1. Import the controller factory:
 *    const { catchAsync } = require('../utils/controllerFactory');
 *
 * 2. Remove asyncHandler imports:
 *    // Remove: const asyncHandler = require('../middleware/asyncHandler');
 *
 * 3. Wrap your async functions with catchAsync:
 *    // Before: exports.myFunction = asyncHandler(async (req, res) => { ... });
 *    // After:  exports.myFunction = catchAsync(async (req, res, next) => { ... });
 *
 * 4. Remove try-catch blocks and use error classes instead:
 *    // Before: throw new Error('Message');
 *    // After:  return next(new ValidationError('Message'));
 *
 * 5. For simple CRUD operations, consider using factory functions:
 *    // Instead of writing custom getById logic:
 *    exports.getDoctor = getOne(User);
 */

module.exports = {
  beforeRefactor,
  afterRefactor,
};
