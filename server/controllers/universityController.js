const University = require("../models/University");

// GET /api/universities/slug/:slug — fetch single university by slug (public)
exports.getUniversityBySlug = async (req, res) => {
  try {
    const university = await University.findOne({ slug: req.params.slug });
    if (!university) return res.status(404).json({ message: "Organization not found" });
    res.json(university);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/universities — list all active universities (public)
exports.getUniversities = async (req, res) => {
  try {
    const universities = await University.find({ isActive: true }).sort({ name: 1 });
    res.json(universities);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/universities/all — list all (admin only)
exports.getAllUniversities = async (req, res) => {
  try {
    const universities = await University.find().sort({ createdAt: -1 });
    res.json(universities);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/universities — create university (admin only)
exports.createUniversity = async (req, res) => {
  const { name, shortName, slug, logoUrl } = req.body;
  if (!name) return res.status(400).json({ message: "University name is required" });
  try {
    const exists = await University.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (exists) return res.status(400).json({ message: "University already exists" });
    // Check slug conflict
    if (slug) {
      const slugConflict = await University.findOne({ slug });
      if (slugConflict) return res.status(400).json({ message: "This URL slug is already taken" });
    }
    const university = await University.create({
      name,
      shortName: shortName || "",
      slug:      slug     || "",
      logoUrl:   logoUrl  || "",
    });
    res.status(201).json(university);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/universities/:id/departments — add department (admin only)
exports.addDepartment = async (req, res) => {
  const { name, code } = req.body;
  if (!name) return res.status(400).json({ message: "Department name is required" });
  try {
    const university = await University.findById(req.params.id);
    if (!university) return res.status(404).json({ message: "University not found" });
    university.departments.push({ name, code: code || "" });
    await university.save();
    res.status(201).json(university);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/universities/:id — update university (admin only)
exports.updateUniversity = async (req, res) => {
  const { name, shortName, slug, logoUrl } = req.body;
  if (!name) return res.status(400).json({ message: "University name is required" });
  try {
    const university = await University.findById(req.params.id);
    if (!university) return res.status(404).json({ message: "University not found" });
    // Check name conflict (ignore self)
    const conflict = await University.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      _id: { $ne: req.params.id },
    });
    if (conflict) return res.status(400).json({ message: "Another university with this name already exists" });
    // Check slug conflict (ignore self)
    if (slug) {
      const slugConflict = await University.findOne({ slug, _id: { $ne: req.params.id } });
      if (slugConflict) return res.status(400).json({ message: "This URL slug is already taken" });
    }
    university.name = name;
    if (shortName !== undefined) university.shortName = shortName;
    if (slug      !== undefined) university.slug      = slug;
    if (logoUrl   !== undefined) university.logoUrl   = logoUrl;
    await university.save();
    res.json(university);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/universities/:id/departments/:deptId — update department (admin only)
exports.updateDepartment = async (req, res) => {
  const { name, code } = req.body;
  if (!name) return res.status(400).json({ message: "Department name is required" });
  try {
    const university = await University.findById(req.params.id);
    if (!university) return res.status(404).json({ message: "University not found" });
    const dept = university.departments.id(req.params.deptId);
    if (!dept) return res.status(404).json({ message: "Department not found" });
    dept.name = name;
    if (code !== undefined) dept.code = code;
    await university.save();
    res.json(university);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/universities/:id — delete university (admin only)
exports.deleteUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);
    if (!university) return res.status(404).json({ message: "University not found" });
    res.json({ message: "University deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/universities/:id/departments/:deptId — delete department (admin only)
exports.deleteDepartment = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) return res.status(404).json({ message: "University not found" });
    university.departments = university.departments.filter(
      (d) => d._id.toString() !== req.params.deptId
    );
    await university.save();
    res.json(university);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
