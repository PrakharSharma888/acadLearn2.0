const User = require("../models/User");

// GET /api/profile/me
exports.getMe = async (req, res) => {
  const user = req.user;
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    phone: user.phone || "",
    university: user.university || null,
    universityName: user.universityName || "",
    department: user.department || "",
    year: user.year || "",
    semester: user.semester || "",
  });
};

// PUT /api/profile/me  — update name / email / academic info
exports.updateMe = async (req, res) => {
  const { name, email, phone, university, universityName, department, year, semester } = req.body;
  try {
    // Check email uniqueness if changing
    if (email && email.toLowerCase() !== req.user.email?.toLowerCase()) {
      const exists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } });
      if (exists) return res.status(400).json({ message: "Email already in use" });
    }

    const updates = {};
    if (name)  updates.name  = name;
    if (email) updates.email = email.toLowerCase();
    if (phone !== undefined) updates.phone = phone;
    if (university !== undefined) updates.university = university || null;
    if (universityName !== undefined) updates.universityName = universityName;
    if (department !== undefined) updates.department = department;
    if (year !== undefined) updates.year = year;
    if (semester !== undefined) updates.semester = semester;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: false }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone || "",
      university: updated.university || null,
      universityName: updated.universityName || "",
      department: updated.department || "",
      year: updated.year || "",
      semester: updated.semester || "",
    });
  } catch (err) {
    console.error("updateMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/profile/password  — change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: "Both fields are required" });
  try {
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ message: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/profile/me  — delete own account
exports.deleteMe = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Account deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
