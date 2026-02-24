const DemoSession = require("../models/DemoSession");

// GET /api/demo-sessions  — public, returns upcoming active sessions
exports.getSessions = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const sessions = await DemoSession.find({ isActive: true, date: { $gte: today } })
      .sort({ date: 1, time: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/demo-sessions/all  — admin: all sessions including past
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await DemoSession.find().sort({ date: -1, time: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// POST /api/demo-sessions  — admin only
exports.createSession = async (req, res) => {
  const { title, classId, className, instructor, description, date, time, category, type, price } = req.body;
  if (!title || !date || !time)
    return res.status(400).json({ message: "Title, date and time are required." });
  
  // Validate paid demos have a price
  if (type === "paid" && (!price || price <= 0)) {
    return res.status(400).json({ message: "Paid demos must have a valid price." });
  }
  
  try {
    const session = await DemoSession.create({
      title, classId: classId || null, className: className || "",
      instructor, description, date, time, category,
      type: type || "free",
      price: type === "paid" ? price : 0,
    });
    res.status(201).json(session);
  } catch (err) {
    console.error("createSession error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// DELETE /api/demo-sessions/:id  — admin only
exports.deleteSession = async (req, res) => {
  try {
    const session = await DemoSession.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found." });
    res.json({ message: "Session deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};
