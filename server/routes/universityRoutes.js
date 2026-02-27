const express = require("express");
const router = express.Router();
const {
  getUniversities,
  getAllUniversities,
  getUniversityBySlug,
  createUniversity,
  updateUniversity,
  addDepartment,
  updateDepartment,
  deleteUniversity,
  deleteDepartment,
} = require("../controllers/universityController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getUniversities);                                                        // public
router.get("/all", protect, admin, getAllUniversities);                                  // admin
router.get("/slug/:slug", getUniversityBySlug);                                          // public — org page
router.post("/", protect, admin, createUniversity);                                      // admin
router.put("/:id", protect, admin, updateUniversity);                                    // admin
router.post("/:id/departments", protect, admin, addDepartment);                          // admin
router.put("/:id/departments/:deptId", protect, admin, updateDepartment);                // admin
router.delete("/:id", protect, admin, deleteUniversity);                                 // admin
router.delete("/:id/departments/:deptId", protect, admin, deleteDepartment);             // admin

module.exports = router;
