const mongoose = require("mongoose");

const eventRegistrationSchema = new mongoose.Schema(
  {
    eventId:    { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Registrant details
    name:       { type: String, required: true },
    parentName: { type: String, default: "" },
    email:      { type: String, required: true },
    phone:      { type: String, default: "" },
    batchYear:  { type: String, default: "" },
    college:    { type: String, default: "" },
    department: { type: String, default: "" },

    // Payment
    isPaid:     { type: Boolean, default: false },
    paymentId:  { type: String, default: "" },   // Razorpay payment_id
    orderId:    { type: String, default: "" },   // Razorpay order_id
    amount:     { type: Number, default: 0 },    // amount paid (₹)

    status:     { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventRegistration", eventRegistrationSchema);
