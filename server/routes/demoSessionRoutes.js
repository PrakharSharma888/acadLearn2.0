const express = require("express");
const router = express.Router();
const {
  getSessions, getAllSessions, createSession, deleteSession,
} = require("../controllers/demoSessionController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/",       getSessions);                   // public — upcoming only
router.get("/all",    protect, admin, getAllSessions); // admin — all
router.post("/",      protect, admin, createSession);
router.delete("/:id", protect, admin, deleteSession);

module.exports = router;
