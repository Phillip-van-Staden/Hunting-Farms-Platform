const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();
const pool = require("./db");
const multer = require("multer"); // For handling file uploads
const personRoutes = require("./routes/personRoutes.js");
const statsRoutes = require("./routes/statsRoutes.js");
const farmRoutes = require("./routes/farmRoutes.js");
const blogRoutes = require("./routes/blogRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
// const adminRoutes = require('./routes/adminRoutes.js');
const fs = require("fs");
const path = require("path");
const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup multer for image file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set directory for storing uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // File name
  },
});
const upload = multer({ storage });

/* ======================
    PERSON CRUD
====================== */
//Get people
app.use("/person", personRoutes);

/* ======================
   Stats
====================== */
app.use("/stats", statsRoutes);

/* ======================
   Farm
====================== */

// ...existing code...
app.use("/farms", farmRoutes);

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/blogs", blogRoutes);

app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("server has started on port 5000");
});
