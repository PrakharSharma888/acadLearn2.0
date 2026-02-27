const express = require("express");
const router = express.Router();
const { getBanners, getAllBanners, createBanner, updateBanner, deleteBanner } = require("../controllers/bannerController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/",       getBanners);                        // public — ?page=junior|professional
router.get("/all",    protect, admin, getAllBanners);      // admin
router.post("/",      protect, admin, createBanner);      // admin
router.put("/:id",    protect, admin, updateBanner);      // admin
router.delete("/:id", protect, admin, deleteBanner);      // admin

module.exports = router;
