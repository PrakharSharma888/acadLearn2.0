const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true },
    imageUrl:  { type: String, required: true },
    link:      { type: String, default: "" },
    showOn:    {
      type: String,
      enum: ["junior", "professional", "both"],
      default: "both",
    },
    isActive:  { type: Boolean, default: true },
    order:     { type: Number, default: 0 },
    // Linked class info (for auto-fill Book Demo modal)
    classId:   { type: String, default: "" },
    className: { type: String, default: "" },
    classSlug: { type: String, default: "" },
    department:{ type: String, default: "" },
    category:  { type: String, enum: ["junior", "professional", ""], default: "" },
    // Scheduled event info (shown on carousel)
    eventDate: { type: String, default: "" },  // "YYYY-MM-DD"
    eventTime: { type: String, default: "" },  // "HH:MM"
    // Target audience
    universityId:       { type: String, default: "" },
    universityName:     { type: String, default: "" },
    targetDepartments:  [{ type: String }],    // e.g. ["Computer Science", "Electrical"]
    // Booking access control
    allowPublicBooking: { type: Boolean, default: true }, // false = only banner click can book
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
