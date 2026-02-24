const mongoose = require("mongoose");

const demoSessionSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    classId:     { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null },
    className:   { type: String, default: "" },
    instructor:  { type: String, default: "AcadLearn Team" },
    description: { type: String, default: "" },
    date:        { type: String, required: true }, // "YYYY-MM-DD"
    time:        { type: String, required: true }, // "HH:MM"
    category:    { type: String, enum: ["junior", "professional", "all"], default: "all" },
    type:        { type: String, enum: ["free", "paid"], default: "free" },
    price:       { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DemoSession", demoSessionSchema);
