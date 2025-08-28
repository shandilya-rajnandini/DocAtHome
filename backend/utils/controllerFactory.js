/* eslint-disable quotes */
/**
 * Controller Factory for handling async operations and error catching
 *
 * This file provides utility functions to reduce boilerplate code in controllers
 * by automatically handling try-catch blocks and error forwarding.
 */

/**
 * Catch async errors and pass them to the global error handler
 *
 * @param {Function} fn - The async controller function to wrap
 * @returns {Function} - The wrapped function that catches errors
 *
 * @example
 * exports.login = catchAsync(async (req, res, next) => {
 *   // Your controller logic here
 *   // No need for try-catch blocks
 * });
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    // Execute the function and catch any promise rejections
    fn(req, res, next).catch(next);
  };
};

/**
 * Filter object to only include allowed fields
 * Useful for sanitizing request bodies before database operations
 *
 * @param {Object} obj - The object to filter
 * @param {...string} allowedFields - The fields to keep
 * @returns {Object} - The filtered object
 *
 * @example
 * const filteredBody = filterObj(req.body, 'name', 'email', 'role');
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * Generic factory function for getting all documents
 * Includes basic pagination, sorting, and filtering
 *
 * @param {Model} Model - Mongoose model
 * @returns {Function} - Controller function
 */
const getAll = (Model) =>
  catchAsync(async (req, res, _next) => {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Model.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query
    const docs = await query;

    res.status(200).json({
      success: true,
      results: docs.length,
      data: docs,
    });
  });

/**
 * Generic factory function for getting one document by ID
 *
 * @param {Model} Model - Mongoose model
 * @param {string} popOptions - Population options (optional)
 * @returns {Function} - Controller function
 */
const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      const { NotFoundError } = require("../middleware/errorHandler");
      return next(new NotFoundError("No document found with that ID"));
    }

    res.status(200).json({
      success: true,
      data: doc,
    });
  });

/**
 * Generic factory function for creating a document
 *
 * @param {Model} Model - Mongoose model
 * @returns {Function} - Controller function
 */
const createOne = (Model) =>
  catchAsync(async (req, res, _next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      success: true,
      data: doc,
    });
  });

/**
 * Generic factory function for updating a document
 *
 * @param {Model} Model - Mongoose model
 * @returns {Function} - Controller function
 */
const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      const { NotFoundError } = require("../middleware/errorHandler");
      return next(new NotFoundError("No document found with that ID"));
    }

    res.status(200).json({
      success: true,
      data: doc,
    });
  });

/**
 * Generic factory function for deleting a document
 *
 * @param {Model} Model - Mongoose model
 * @returns {Function} - Controller function
 */
const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      const { NotFoundError } = require("../middleware/errorHandler");
      return next(new NotFoundError("No document found with that ID"));
    }

    res.status(204).json({
      success: true,
      data: null,
    });
  });

module.exports = {
  catchAsync,
  filterObj,
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
};
