const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  duration:    { type: String, default: "" },
  description: { type: String, default: "" },
});

const subjectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: "" },
  price:       { type: Number, default: 0 },   // 0 = free
  lessons:     [lessonSchema],
});

const classSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    subtitle:    { type: String, default: "" },
    category: {
      type: String,
      enum: ["junior", "professional"],
      required: true,
    },
    level:         { type: String, default: "Beginner" },
    instructor:    { type: String, default: "AcadLearn Team" },
    description:   { type: String, default: "" },
    subjects:      [subjectSchema],
    curriculum:    [lessonSchema],
    totalLessons:  { type: Number, default: 0 },
    duration:      { type: String, default: "" },
    price:         { type: Number, default: 0 },
    badge:         { type: String, default: "" },
    color:         { type: String, default: "bg-indigo-600" },
    rating:        { type: Number, default: 4.5 },
    enrolledCount: { type: Number, default: 0 },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
