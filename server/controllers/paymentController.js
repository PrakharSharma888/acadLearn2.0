const Razorpay = require("razorpay");
const crypto   = require("crypto");
const Class    = require("../models/Class");

// Lazily initialise so missing keys don't crash the server at startup
let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env");
    }
    _razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
};

// POST /api/payment/create-order
// Body: { classId }
exports.createOrder = async (req, res) => {
  try {
    const { classId } = req.body;
    if (!classId) return res.status(400).json({ message: "classId is required." });

    const cls = await Class.findById(classId);
    if (!cls || !cls.isActive) return res.status(404).json({ message: "Course not found." });
    if (!cls.price || cls.price <= 0) return res.status(400).json({ message: "This course is free — no payment needed." });

    const order = await getRazorpay().orders.create({
      amount:   Math.round(cls.price * 100), // paise
      currency: "INR",
      receipt:  `rcpt_${classId}_${Date.now()}`,
      notes:    { classId: cls._id.toString(), className: cls.title },
    });

    res.status(200).json({
      orderId:   order.id,
      amount:    order.amount,
      currency:  order.currency,
      className: cls.title,
      keyId:     process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay createOrder error:", err);
    res.status(500).json({ message: "Could not create payment order. Please try again." });
  }
};

// POST /api/payment/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, classId }
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, classId } = req.body;

    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed. Signature mismatch." });
    }

    // Increment enrolled count
    if (classId) {
      await Class.findByIdAndUpdate(classId, { $inc: { enrolledCount: 1 } });
    }

    res.status(200).json({
      success:   true,
      paymentId: razorpay_payment_id,
      message:   "Payment verified successfully.",
    });
  } catch (err) {
    console.error("Razorpay verifyPayment error:", err);
    res.status(500).json({ message: "Payment verification failed. Please contact support." });
  }
};
