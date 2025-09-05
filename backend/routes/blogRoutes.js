const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const multer = require("multer");

// Setup multer for temporary file storage (before Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET all blogs
router.get("/", blogController.getAllBlogs);

// GET all approved blogs
router.get("/approved", blogController.getApprovedBlogs);

// GET blog details
router.get("/:bid", blogController.getBlogDetails);

// POST add blog
router.post("/", upload.single("bimage"), blogController.addBlog);

// PUT update blog
router.put("/:id", upload.single("bimage"), blogController.updateBlog);

// DELETE blog
router.delete("/:id", blogController.deleteBlog);

module.exports = router;
