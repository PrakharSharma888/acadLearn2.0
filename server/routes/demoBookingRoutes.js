const express = require("express");
const router = express.Router();
const { bookDemo, getBookings, getMyBookings, cancelBooking, updateBookingStatus } = require("../controllers/demoBookingController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, bookDemo);
router.get("/", protect, admin, getBookings);
router.get("/my", protect, getMyBookings);
router.put("/:id/status", protect, admin, updateBookingStatus);
router.delete("/:id", protect, cancelBooking);

module.exports = router;
