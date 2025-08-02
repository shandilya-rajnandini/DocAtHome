const express = require("express");
const router = express.Router();
const {
  getCareCircle,
  inviteMember,
} = require("../controllers/careCircleController");
const { protect }= require("../middleware/authMiddleware");

router.get("/my-care-circle", protect, getCareCircle);
router.post("/my-care-circle/invite", protect, inviteMember);

module.exports = router;
