const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getMe, updateMe, changePassword, deleteMe } = require("../controllers/profileController");

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/password", protect, changePassword);
router.delete("/me", protect, deleteMe);

module.exports = router;
