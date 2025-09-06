const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const multer = require("multer");
const { authenticateToken } = require("../middleware/auth");

// Setup multer for temporary file storage (before Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET all blogs (public route)
router.get("/", blogController.getAllBlogs);

// GET all approved blogs (public route)
router.get("/approved", blogController.getApprovedBlogs);

// GET blog details (public route)
router.get("/:bid", blogController.getBlogDetails);

// POST add blog (protected route)
router.post(
  "/",
  authenticateToken,
  upload.single("bimage"),
  blogController.addBlog
);

// PUT update blog (protected route)
router.put(
  "/:id",
  authenticateToken,
  upload.single("bimage"),
  blogController.updateBlog
);

// DELETE blog (protected route)
router.delete("/:id", authenticateToken, blogController.deleteBlog);

module.exports = router;
