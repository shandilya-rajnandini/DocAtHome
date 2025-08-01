const CareCircle = require("../models/CareCircle");
const asyncHandler = require('../middleware/asyncHandler');

exports.getCareCircle = asyncHandler(async (req, res) => {
    const circle = await CareCircle.findOne({ patient: req.user.id }).populate(
      "members.user",
      "name email"
    );
    res.json(circle || { members: [] });
});

exports.inviteMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ error: "Email and role are required" });
  }

    let circle = await CareCircle.findOne({ patient: req.user.id });

    if (!circle) {
      circle = new CareCircle({ patient: req.user.id, members: [] });
    }

    circle.members.push({
      email,
      role,
      status: "Pending",
    });

    await circle.save();
    res.status(200).json(circle);
});
