const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title:          { type: String, required: true },
    description:    { type: String, default: "" },
    imageUrl:       { type: String, default: "" },

    // Date & time
    date:           { type: String, required: true },  // "YYYY-MM-DD"
    time:           { type: String, default: "" },      // "HH:MM"

    // Pricing
    isFree:         { type: Boolean, default: true },
    price:          { type: Number, default: 0 },       // 0 if free

    // Slots
    totalSlots:     { type: Number, default: 0 },       // 0 = unlimited
    registeredCount:{ type: Number, default: 0 },

    // Linked university
    universityId:   { type: mongoose.Schema.Types.ObjectId, ref: "University", default: null },
    universityName: { type: String, default: "" },
    targetDepartments: [{ type: String }],

    // Status
    isActive:       { type: Boolean, default: true },
    showOn:         { type: String, enum: ["junior", "professional", "both", "org"], default: "org" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
