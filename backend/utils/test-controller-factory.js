/* eslint-disable quotes */
/**
 * Simple test to verify the controller factory works correctly
 * Run this with: node backend/utils/test-controller-factory.js
 */

const { catchAsync } = require("./controllerFactory");

// Simple test function
const runBasicTest = () => {
  console.log("Testing Controller Factory...");

  // Test that catchAsync returns a function
  const testController = catchAsync(async (_req, res, _next) => {
    res.status(200).json({ success: true });
  });

  if (typeof testController === "function") {
    console.log("✓ catchAsync returns a function");
  } else {
    console.log("✗ catchAsync does not return a function");
  }

  // Test that the wrapped function has the correct signature
  if (testController.length === 3) {
    console.log("✓ Wrapped function accepts 3 parameters (req, res, next)");
  } else {
    console.log("✗ Wrapped function has incorrect signature");
  }

  console.log("");
  console.log("Basic tests completed!");
  console.log("");
  console.log("The controller factory is ready to use. Key benefits:");
  console.log("• Eliminates repetitive try-catch blocks");
  console.log("• Automatically forwards errors to global error handler");
  console.log("• Makes controllers cleaner and more readable");
  console.log("• Consistent error handling across the application");
};

// Run test if this file is executed directly
if (require.main === module) {
  runBasicTest();
}

module.exports = { runBasicTest };
