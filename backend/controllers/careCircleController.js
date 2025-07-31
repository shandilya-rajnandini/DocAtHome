const CareCircle = require("../models/CareCircle");

exports.getCareCircle = async (req, res) => {
  try {
    const circle = await CareCircle.findOne({ patient: req.user.id }).populate(
      "members.user",
      "name email"
    );
    res.json(circle || { members: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.inviteMember = async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ error: "Email and role are required" });
  }

  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
