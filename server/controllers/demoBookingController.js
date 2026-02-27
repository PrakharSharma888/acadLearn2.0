const DemoBooking = require("../models/DemoBooking");
const { sendDemoBookingMail } = require("../utils/sendDemoBookingMail");

// POST /api/demo-booking  (protected)
exports.bookDemo = async (req, res) => {
  const { classId, className, parentName, phone, email, studentName, grade, college, selectedDepartment } = req.body;
  if (!parentName || !phone || !email || !studentName || !grade)
    return res.status(400).json({ message: "All required fields must be filled." });
  try {
    // Prevent duplicate booking on the same day
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await DemoBooking.findOne({
      userId:    req.user._id,
      createdAt: { $gte: today, $lt: tomorrow },
      status:    { $in: ["pending", "confirmed"] },
    });
    if (existing) {
      return res.status(409).json({
        message: "You have already booked a demo today. Please wait for our team to contact you, or try again tomorrow.",
      });
    }

    const booking = await DemoBooking.create({
      userId:             req.user._id,
      classId:            classId  || null,
      className:          className || "",
      college:            college            || "",
      selectedDepartment: selectedDepartment || "",
      parentName,
      phone,
      email:              email.toLowerCase(),
      studentName,
      grade,
    });
    await sendDemoBookingMail({ parentName, email, studentName, grade, className, bookingId: booking._id });
    res.status(201).json({ message: "Demo booked successfully! Check your email for confirmation.", booking });
  } catch (error) {
    console.error("Demo booking error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// GET /api/demo-booking  — all bookings (admin only)
exports.getBookings = async (req, res) => {
  try {
    const bookings = await DemoBooking.find().sort({ createdAt: -1 }).populate("classId", "title category");
    res.status(200).json(bookings);
  } catch {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// GET /api/demo-booking/my  — user's own bookings (or all if admin)
exports.getMyBookings = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const all = await DemoBooking.find().sort({ createdAt: -1 }).populate("classId", "title category");
      return res.status(200).json(all);
    }
    const bookings = await DemoBooking.find({ userId: req.user._id }).sort({ createdAt: -1 }).populate("classId", "title category");
    res.status(200).json(bookings);
  } catch {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// DELETE /api/demo-booking/:id  — cancel own booking (protected)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await DemoBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    // Allow if userId matches OR booking has no userId (legacy/guest bookings)
    if (booking.userId && booking.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorised to cancel this booking" });
    if (booking.status === "completed")
      return res.status(400).json({ message: "Cannot cancel a completed booking" });
    if (booking.status === "cancelled")
      return res.status(400).json({ message: "Booking is already cancelled" });
    booking.status = "cancelled";
    await booking.save();
    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    console.error("cancelBooking error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// PUT /api/demo-booking/:id/status — update status + confirmed date (admin only)
exports.updateBookingStatus = async (req, res) => {
  const { status, confirmedDate, confirmedTime } = req.body;
  const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
  if (!status || !validStatuses.includes(status))
    return res.status(400).json({ message: "Invalid status." });
  try {
    const booking = await DemoBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.status = status;
    if (confirmedDate) booking.confirmedDate = confirmedDate;
    if (confirmedTime !== undefined) booking.confirmedTime = confirmedTime;
    await booking.save();
    res.json({ message: `Booking ${status} successfully`, booking });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};
