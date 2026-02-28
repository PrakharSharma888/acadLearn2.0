const express    = require("express");
const router     = express.Router();
const {
  getEvents, getAllEvents, getEvent,
  createEvent, updateEvent, deleteEvent,
  getRegistrations,
  registerFree, createPaymentOrder, verifyPayment,
} = require("../controllers/eventController");
const { protect, admin } = require("../middleware/authMiddleware");
const { optionalAuth }   = require("../middleware/authMiddleware");

router.get("/",              getEvents);                            // public — ?universityId=
router.get("/all",           protect, admin, getAllEvents);         // admin
router.get("/:id",           getEvent);                            // public
router.post("/",             protect, admin, createEvent);         // admin
router.put("/:id",           protect, admin, updateEvent);         // admin
router.delete("/:id",        protect, admin, deleteEvent);         // admin
router.get("/:id/registrations", protect, admin, getRegistrations); // admin

// Registration routes (optionalAuth — logged-in or guest)
router.post("/:id/register",      optionalAuth, registerFree);        // free event
router.post("/:id/create-order",  optionalAuth, createPaymentOrder);  // paid: create Razorpay order
router.post("/:id/verify-payment",optionalAuth, verifyPayment);       // paid: verify + register

module.exports = router;
