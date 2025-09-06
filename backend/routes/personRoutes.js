const express = require("express");
const router = express.Router();
const personController = require("../controllers/personController");
const { authenticateToken } = require("../middleware/auth");

// Get all people (protected route)
router.get("/", authenticateToken, personController.getPeople);

// Get person by email (protected route)
router.get("/:id", authenticateToken, personController.getPersonByEmail);

// Register new user (public route)
router.post("/signup", personController.signup);

// User login (public route)
router.post("/login", personController.login);

// Update person (protected route)
router.put("/update/:id", authenticateToken, personController.updatePerson);

// Update password (protected route)
router.put(
  "/updatepassword/:id",
  authenticateToken,
  personController.updatePassword
);

// Update notifications (protected route)
router.put(
  "/updatenotifications/:id",
  authenticateToken,
  personController.updateNotifications
);

module.exports = router;
