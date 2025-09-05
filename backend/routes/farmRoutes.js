const express = require("express");
const router = express.Router();
const FarmController = require("../controllers/FarmController");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinary");

// Setup multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads", // Cloudinary folder name
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});
const upload = multer({ storage });

// GET all farms
router.get("/", FarmController.getAllFarms);

// GET farms by owner
router.get("/:pId/owner", FarmController.getFarmsByOwner);

// GET farm details
router.get("/:fId/farmdetails", FarmController.getFarmDetails);

// POST add farm
router.post("/addfarm", upload.array("images", 10), FarmController.addFarm);

// PUT update farm details
router.put(
  "/:fId/farmdetails",
  upload.array("images", 10),
  FarmController.updateFarmDetails
);

// DELETE farm
router.delete("/:fId", FarmController.deleteFarm);

// POST add review
router.post("/:fid/review", FarmController.addReview);

module.exports = router;
