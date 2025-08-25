const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup multer for image file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/blogs/');
    // ensure directory exists
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// GET all blogs
router.get('/', blogController.getAllBlogs);

// GET all approved blogs
router.get('/approved', blogController.getApprovedBlogs);

// GET blog details
router.get('/:bid', blogController.getBlogDetails);

// POST add blog
router.post('/', upload.single('bimage'), blogController.addBlog);

// PUT update blog
router.put('/:id', upload.single('bimage'), blogController.updateBlog);

// DELETE blog
router.delete('/:id', blogController.deleteBlog);

module.exports = router;