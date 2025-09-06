const jwt = require("jsonwebtoken");
const pool = require("../db");

// JWT Secret - in production, this should be in environment variables
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database to ensure they still exist and aren't blocked
    const result = await pool.query("SELECT * FROM person WHERE pid = $1", [
      decoded.userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // Check if user is blocked
    if (user.pblocked) {
      return res.status(401).json({ message: "Account has been blocked" });
    }

    // Add user info to request object
    req.user = {
      id: user.pid,
      email: user.pemail,
      first_name: user.pnaam,
      last_name: user.pvan,
      admin: user.padmin,
      category: user.pcategory,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Token verification failed" });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.admin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.pid,
      email: user.pemail,
      admin: user.padmin,
    },
    JWT_SECRET,
    { expiresIn: "24h" } // Token expires in 24 hours
  );
};

module.exports = {
  authenticateToken,
  requireAdmin,
  generateToken,
  JWT_SECRET,
};
