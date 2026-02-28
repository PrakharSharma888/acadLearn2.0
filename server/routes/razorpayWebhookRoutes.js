const express = require("express");
const router = express.Router();
const { razorpayWebhook } = require("../controllers/razorpayWebhookController");

// Razorpay webhook endpoint (must be raw body)
router.post("/razorpay-webhook", razorpayWebhook);

module.exports = router;
