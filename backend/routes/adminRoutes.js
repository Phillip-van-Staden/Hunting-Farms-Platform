const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// All admin routes require authentication and admin privileges
router.get(
  "/stats",
  authenticateToken,
  requireAdmin,
  adminController.getAdminStats
);

router.get("/farms", authenticateToken, requireAdmin, adminController.getFarms);

router.get("/blogs", authenticateToken, requireAdmin, adminController.getBlogs);

router.put(
  "/blogs/:id",
  authenticateToken,
  requireAdmin,
  adminController.updateBlog
);

router.get("/users", authenticateToken, requireAdmin, adminController.getUsers);

router.put(
  "/users/:id",
  authenticateToken,
  requireAdmin,
  adminController.updateUser
);

router.put("/users/reviews/:id", adminController.updateUserReviews);
router.get(
  "/users/:id/reviews",
  authenticateToken,
  requireAdmin,
  adminController.getUserReviews
);

module.exports = router;
