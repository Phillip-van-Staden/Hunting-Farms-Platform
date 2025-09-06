const express = require("express");
const router = express.Router();
const FarmController = require("../controllers/FarmController");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinary");
const { authenticateToken } = require("../middleware/auth");

// Setup multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads", // Cloudinary folder name
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});
const upload = multer({ storage });

// GET all farms (public route)
router.get("/", FarmController.getAllFarms);

// GET farms by owner (protected route)
router.get("/:pId/owner", authenticateToken, FarmController.getFarmsByOwner);

// GET farm details (public route)
router.get("/:fId/farmdetails", FarmController.getFarmDetails);

// POST add farm (protected route)
router.post(
  "/addfarm",
  authenticateToken,
  upload.array("images", 10),
  FarmController.addFarm
);

// PUT update farm details (protected route)
router.put(
  "/:fId/farmdetails",
  authenticateToken,
  upload.array("images", 10),
  FarmController.updateFarmDetails
);

// DELETE farm (protected route)
router.delete("/:fId", authenticateToken, FarmController.deleteFarm);

// POST add review (protected route)
router.post("/:fid/review", authenticateToken, FarmController.addReview);

module.exports = router;
