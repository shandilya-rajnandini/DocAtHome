const mongoose = require("mongoose");

/**
 * Transaction Schema
 * Note: All monetary amounts (amount) are stored in paise (1 rupee = 100 paise)
 * This ensures precise financial calculations without floating-point precision issues
 */
const transactionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Transaction amount cannot be negative"],
      validate: {
        validator: function (amount) {
          // Ensure amount is a non-negative integer (stored in paise)
          return Number.isInteger(amount) && amount >= 0;
        },
        message: "Transaction amount must be a non-negative integer in paise",
      },
    },
    currency: {
      type: String,
      default: "INR",
    },
    description: {
      type: String,
      default: "No description",
    },
    status: {
      type: String,
      enum: ["created", "success", "failed"],
      default: "success",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
