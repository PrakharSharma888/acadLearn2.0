// Razorpay Webhook Handler for Payment Success
const crypto = require("crypto");
const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");

// POST /api/events/razorpay-webhook
exports.razorpayWebhook = async (req, res) => {
  // Razorpay sends raw body, so signature must be verified on raw body

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  // Razorpay sends raw body as Buffer
  const rawBody = req.body;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  if (signature !== expectedSignature) {
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  // Parse JSON from raw body
  let parsed;
  try {
    parsed = JSON.parse(rawBody.toString());
  } catch {
    return res.status(400).json({ message: "Invalid JSON body" });
  }

  const event = parsed.event;
  if (event === "payment.captured") {
    const payment = parsed.payload.payment.entity;
    const orderId = payment.order_id;
    const email = payment.email;
    // Find the event by orderId in EventRegistration
    const reg = await EventRegistration.findOne({ orderId });
    if (reg && !reg.isPaid) {
      reg.isPaid = true;
      reg.paymentId = payment.id;
      reg.status = "confirmed";
      await reg.save();
      // Optionally, update event registeredCount
      await Event.findByIdAndUpdate(reg.eventId, { $inc: { registeredCount: 1 } });
    }
  }
  // Add more event types as needed
  res.json({ received: true });
};
