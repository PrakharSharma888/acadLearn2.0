const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Routes
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const classRoutes = require("./routes/classRoutes");
const demoBookingRoutes = require("./routes/demoBookingRoutes");
const profileRoutes = require("./routes/profileRoutes");
const demoSessionRoutes = require("./routes/demoSessionRoutes");
const paymentRoutes      = require("./routes/paymentRoutes");
const universityRoutes   = require("./routes/universityRoutes");
const bannerRoutes       = require("./routes/bannerRoutes");
const eventRoutes = require("./routes/eventRoutes");
const razorpayWebhookRoutes = require("./routes/razorpayWebhookRoutes");

// Razorpay webhook needs raw body for signature verification
const bodyParser = require("body-parser");
app.use("/api/events/razorpay-webhook", bodyParser.raw({ type: "application/json" }));
app.use("/api/events", eventRoutes);
app.use("/api/events", razorpayWebhookRoutes);
// Other routes
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/demo-booking", demoBookingRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/demo-sessions", demoSessionRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/universities", universityRoutes);
app.use("/api/banners", bannerRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// if (process.env.NODE_ENV !== "production") {
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
// }

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
