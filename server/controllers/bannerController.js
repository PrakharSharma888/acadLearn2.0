const Banner = require("../models/Banner");

// GET /api/banners?page=junior|professional  — public, filtered by showOn
exports.getBanners = async (req, res) => {
  try {
    const { page } = req.query; // "junior" | "professional"
    // isActive: treat missing/null as active (backwards-compat with old docs)
    const activeFilter = { $or: [{ isActive: true }, { isActive: { $exists: false } }, { isActive: null }] };

    let showOnFilter = {};
    if (page === "junior") {
      showOnFilter = { $or: [
        { showOn: { $in: ["junior", "both"] } },
        { showOn: { $exists: false } },
        { showOn: null },
        { showOn: "" },
      ]};
    } else if (page === "professional") {
      showOnFilter = { $or: [
        { showOn: { $in: ["professional", "both"] } },
        { showOn: { $exists: false } },
        { showOn: null },
        { showOn: "" },
      ]};
    }

    const filter = page
      ? { $and: [activeFilter, showOnFilter] }
      : activeFilter;

    const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/banners/all — admin, all banners
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/banners — admin, create
exports.createBanner = async (req, res) => {
  const {
    title, imageUrl, link, showOn, order,
    classId, className, classSlug, department, category,
    eventDate, eventTime,
    universityId, universityName, targetDepartments,
    allowPublicBooking, eventId,
  } = req.body;
  if (!title || !imageUrl) return res.status(400).json({ message: "Title and image URL are required" });
  try {
    const banner = await Banner.create({
      title, imageUrl, link, showOn, order: order || 0,
      classId: classId || "", className: className || "",
      classSlug: classSlug || "", department: department || "",
      category: category || "",
      eventDate: eventDate || "", eventTime: eventTime || "",
      universityId: universityId || "", universityName: universityName || "",
      targetDepartments: Array.isArray(targetDepartments) ? targetDepartments : [],
      allowPublicBooking: allowPublicBooking !== false,
      eventId: eventId || "",
    });
    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/banners/:id — admin, update
exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json(banner);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/banners/:id — admin, delete
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json({ message: "Banner deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
