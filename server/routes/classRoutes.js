const express = require("express");
const router = express.Router();
const { getClasses, getClassById, createClass, updateClass, deleteClass } = require("../controllers/classController");
const { protect, admin, optionalAuth } = require("../middleware/authMiddleware");

router.get("/", getClasses);
router.get("/:id", optionalAuth, getClassById);
router.post("/", protect, admin, createClass);
router.put("/:id", protect, admin, updateClass);
router.delete("/:id", protect, admin, deleteClass);

module.exports = router;
