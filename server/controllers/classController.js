const Class        = require("../models/Class");
const DemoSession  = require("../models/DemoSession");

// GET /api/classes  — optionally filter by ?category=junior|professional
// Each class gets a `nextDemoSession` field (nearest upcoming session, or null)
exports.getClasses = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;

    const today   = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const [classes, sessions] = await Promise.all([
      Class.find(filter).sort({ createdAt: -1 }).lean(),
      DemoSession.find({ isActive: true, date: { $gte: today } }).lean(),
    ]);

    // Build map: classId (string) → earliest upcoming session
    const sessionMap = {};
    sessions.forEach((s) => {
      const id = s.classId?.toString();
      if (!id) return;
      const existing = sessionMap[id];
      if (!existing || s.date < existing.date || (s.date === existing.date && s.time < existing.time)) {
        sessionMap[id] = { date: s.date, time: s.time, title: s.title, _id: s._id };
      }
    });

    const result = classes.map((c) => ({
      ...c,
      nextDemoSession: sessionMap[c._id.toString()] || null,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// GET /api/classes/:id  — fetch single class with curriculum
// Admins (req.user set by optional auth) can see inactive classes; guests/students cannot
exports.getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found." });
    const isAdmin = req.user?.role === "admin";
    if (!cls.isActive && !isAdmin) return res.status(404).json({ message: "Class not found." });
    res.status(200).json(cls);
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// POST /api/classes  — create class (admin only)
exports.createClass = async (req, res) => {
  try {
    const cls = await Class.create(req.body);
    res.status(201).json(cls);
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// PUT /api/classes/:id  — update class (admin only)
exports.updateClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found." });

    // Scalar fields
    const scalars = ["title", "subtitle", "category", "level", "instructor",
                     "description", "duration", "price", "badge", "color",
                     "rating", "enrolledCount", "isActive", "totalLessons"];
    scalars.forEach((key) => {
      if (req.body[key] !== undefined) cls[key] = req.body[key];
    });

    // Replace subdocument arrays entirely when provided
    if (req.body.subjects  !== undefined) cls.subjects  = req.body.subjects;
    if (req.body.curriculum !== undefined) cls.curriculum = req.body.curriculum;

    await cls.save();
    res.status(200).json(cls);
  } catch (error) {
    console.error("updateClass error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// DELETE /api/classes/:id  — delete class (admin only)
exports.deleteClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found." });
    res.status(200).json({ message: "Class deleted." });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};
