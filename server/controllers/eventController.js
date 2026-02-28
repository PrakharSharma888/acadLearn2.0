const Razorpay = require("razorpay");
const crypto   = require("crypto");
const Event    = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");

let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay keys not configured.");
    }
    _razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
};

// ── GET /api/events  — public, optionally filter by universityId / page ───────
exports.getEvents = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.universityId) filter.universityId = req.query.universityId;
    // page=junior  → showOn in [junior, both]
    // page=professional → showOn in [professional, both]
    // page=org (or no page) → showOn = org  (default, university-specific events)
    if (req.query.page === "junior") {
      filter.showOn = { $in: ["junior", "both"] };
    } else if (req.query.page === "professional") {
      filter.showOn = { $in: ["professional", "both"] };
    } else if (!req.query.universityId) {
      // no page, no university filter — return all active events
    } else {
      // university-specific: only org events
      filter.showOn = { $in: ["org", "junior", "both", "professional"] };
    }
    const events = await Event.find(filter).sort({ date: 1, createdAt: -1 });
    res.json(events);
  } catch { res.status(500).json({ message: "Server error" }); }
};

// ── GET /api/events/all — admin, all events ───────────────────────────────────
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch { res.status(500).json({ message: "Server error" }); }
};

// ── GET /api/events/:id — single event (public) ───────────────────────────────
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch { res.status(500).json({ message: "Server error" }); }
};

// ── POST /api/events — admin, create event ────────────────────────────────────
exports.createEvent = async (req, res) => {
  const {
    title, description, imageUrl, date, time,
    isFree, price, totalSlots,
    universityId, universityName, targetDepartments, showOn,
  } = req.body;
  if (!title || !date) return res.status(400).json({ message: "Title and date are required" });
  try {
    const event = await Event.create({
      title,
      description:       description       || "",
      imageUrl:          imageUrl          || "",
      date,
      time:              time              || "",
      isFree:            isFree !== false,
      price:             isFree !== false ? 0 : (Number(price) || 0),
      totalSlots:        Number(totalSlots) || 0,
      universityId:      universityId      || null,
      universityName:    universityName    || "",
      targetDepartments: Array.isArray(targetDepartments) ? targetDepartments : [],
      showOn:            showOn            || "org",
    });
    res.status(201).json(event);
  } catch (err) {
    console.error("createEvent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── PUT /api/events/:id — admin, update event ─────────────────────────────────
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    const fields = [
      "title","description","imageUrl","date","time",
      "isFree","price","totalSlots",
      "universityId","universityName","targetDepartments",
      "isActive","showOn",
    ];
    fields.forEach((f) => { if (req.body[f] !== undefined) event[f] = req.body[f]; });
    // If toggled to free, reset price
    if (event.isFree) event.price = 0;
    await event.save();
    res.json(event);
  } catch { res.status(500).json({ message: "Server error" }); }
};

// ── DELETE /api/events/:id — admin ────────────────────────────────────────────
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    await EventRegistration.deleteMany({ eventId: req.params.id });
    res.json({ message: "Event deleted" });
  } catch { res.status(500).json({ message: "Server error" }); }
};

// ── GET /api/events/:id/registrations — admin ─────────────────────────────────
exports.getRegistrations = async (req, res) => {
  try {
    const regs = await EventRegistration.find({ eventId: req.params.id })
      .populate("userId", "name email universityName department year semester")
      .sort({ createdAt: -1 });
    res.json(regs);
  } catch { res.status(500).json({ message: "Server error" }); }
};

// ── POST /api/events/:id/register — free event registration ──────────────────
exports.registerFree = async (req, res) => {
  const { name, parentName, email, phone, batchYear, college, department } = req.body;
  if (!name || !email) return res.status(400).json({ message: "Name and email are required" });
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.isActive) return res.status(404).json({ message: "Event not found" });
    if (!event.isFree) return res.status(400).json({ message: "This is a paid event. Use the payment flow." });

    // Check slots
    if (event.totalSlots > 0 && event.registeredCount >= event.totalSlots) {
      return res.status(400).json({ message: "Sorry, all slots are full!" });
    }

    // Prevent duplicate
    const existing = await EventRegistration.findOne({ eventId: event._id, email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "You are already registered for this event." });

    const reg = await EventRegistration.create({
      eventId:    event._id,
      userId:     req.user?._id || null,
      name,
      parentName: parentName  || "",
      email:      email.toLowerCase(),
      phone:      phone       || "",
      batchYear:  batchYear   || "",
      college:    college     || "",
      department: department  || "",
      isPaid:     false,
      status:     "confirmed",
    });
    await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } });
    res.status(201).json({ message: "Registered successfully!", registration: reg });
  } catch (err) {
    console.error("registerFree error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/events/:id/create-order — paid event, create Razorpay order ────
exports.createPaymentOrder = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.isActive) return res.status(404).json({ message: "Event not found" });
    if (event.isFree) return res.status(400).json({ message: "This event is free — no payment needed." });
    if (event.totalSlots > 0 && event.registeredCount >= event.totalSlots) {
      return res.status(400).json({ message: "All slots are full!" });
    }

    const order = await getRazorpay().orders.create({
      amount:   Math.round(event.price * 100), // paise
      currency: "INR",
      receipt:  `evt_${event._id}_${Date.now()}`,
      notes:    { eventId: event._id.toString(), eventTitle: event.title },
    });

    res.json({
      orderId:    order.id,
      amount:     order.amount,
      currency:   order.currency,
      eventTitle: event.title,
      keyId:      process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("createPaymentOrder error:", err);
    res.status(500).json({ message: "Could not create payment order." });
  }
};

// ── POST /api/events/:id/verify-payment — verify + complete registration ──────
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, name, parentName, email, phone, batchYear, college, department } = req.body;
  if (!name || !email) return res.status(400).json({ message: "Name and email are required" });
  try {
    // Verify signature
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed. Signature mismatch." });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Prevent duplicate
    const existing = await EventRegistration.findOne({ eventId: event._id, email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "You are already registered for this event." });

    const reg = await EventRegistration.create({
      eventId:    event._id,
      userId:     req.user?._id || null,
      name,
      parentName: parentName  || "",
      email:      email.toLowerCase(),
      phone:      phone       || "",
      batchYear:  batchYear   || "",
      college:    college     || "",
      department: department  || "",
      isPaid:     true,
      paymentId:  razorpay_payment_id,
      orderId:    razorpay_order_id,
      amount:     event.price,
      status:     "confirmed",
    });
    await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } });
    res.json({ success: true, message: "Payment verified & registered!", registration: reg });
  } catch (err) {
    console.error("verifyPayment error:", err);
    res.status(500).json({ message: "Payment verification failed." });
  }
};
