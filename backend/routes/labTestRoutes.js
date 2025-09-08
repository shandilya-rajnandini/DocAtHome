const express = require('express');
const LabTest = require("../models/LabTest");
const router = express.Router();
const { bookLabTest } = require('../controllers/labTestController');
const { protect } = require('../middleware/authMiddleware');
const { 
  validate, 
  labTestSchemas, 
  limitRequestSize, 
  detectXSS 
} = require('../middleware/validation');

// Apply comprehensive security middleware to all lab test routes
router.use(limitRequestSize);
router.use(detectXSS);

// POST /api/lab-tests - Book a lab test with comprehensive validation
// The route is protected; only logged-in users can book tests.
router.route('/')
    .post(protect, 
          validate(labTestSchemas.create), 
          bookLabTest);

          router.put("/:id/status", protect, async (req, res) => {
            try {
              const { status } = req.body;
              const validStatuses = [
                "Pending",
                "Sample Collected",
                "Report Ready",
                "Completed",
              ];

              if (!validStatuses.includes(status)) {
                return res.status(400).json({ msg: "Invalid status value" });
              }

              const labTest = await LabTest.findById(req.params.id);
              if (!labTest) {
                return res.status(404).json({ msg: "Lab test not found" });
              }

              //  Check role or technician ownership
              if (req.user.role !== "technician" && req.user.role !== "admin") {
                return res.status(403).json({
                  msg: "Only technicians or admins can update status",
                });
              }

              if (
                labTest.technician &&
                labTest.technician.toString() !== req.user._id.toString()
              ) {
                return res
                  .status(403)
                  .json({ msg: "Not authorized for this test" });
              }

              labTest.status = status;
              await labTest.save();

              res.json({ msg: "Lab test status updated", labTest });
            } catch (error) {
              console.error(error);
              res
                .status(500)
                .json({ msg: "Server error", error: error.message });
            }
          });

module.exports = router;