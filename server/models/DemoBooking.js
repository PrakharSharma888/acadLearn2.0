const mongoose = require("mongoose");

const demoBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
    },
    className: { type: String, default: "" },
    parentName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    studentName: { type: String, required: true },
    grade: { type: String, required: true },
    preferredDate: { type: String, default: "" },
    confirmedDate: { type: String, default: "" },
    confirmedTime: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DemoBooking", demoBookingSchema);
