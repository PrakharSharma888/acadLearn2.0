const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, default: "" },
});

const universitySchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, unique: true },
    shortName: { type: String, default: "" },
    slug:      { type: String, default: "", unique: true, sparse: true }, // e.g. "delhi-university"
    logoUrl:   { type: String, default: "" },
    departments: [departmentSchema],
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("University", universitySchema);
