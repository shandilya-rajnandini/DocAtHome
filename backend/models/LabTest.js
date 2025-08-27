const mongoose = require('mongoose');

const LabTestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    testName: {
      type: String,
      required: [
        true,
        "Please specify the name of the test (e.g., Complete Blood Count).",
      ],
    },
    collectionDate: {
      type: String, // Storing as 'YYYY-MM-DD'
      required: true,
    },
    collectionTime: {
      type: String, // Storing as 'HH:MM AM/PM'
      required: true,
    },
    patientAddress: {
      // The address for sample collection
      type: String,
      required: [true, "Please provide the collection address."],
    },
    status: {
      type: String,
      enum: ["Pending", "Sample Collected", "Report Ready", "Completed"],
      default: "Pending",
    },
    // The fee includes the visit charge + transportation
    totalFee: {
      type: Number,
      required: true,
    },
    technician: {
      type: mongoose.Schema.ObjectId,
      ref: "User", // technician assigned to this test
      required: false, // optional until assignment
    },
  },{ timestamps: true }
);

module.exports = mongoose.model('LabTest', LabTestSchema);