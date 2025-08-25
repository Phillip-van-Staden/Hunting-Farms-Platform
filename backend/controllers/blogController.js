const pool = require('../db');
const path = require('path');
const fs = require('fs');

// Get all blogs
exports.getAllBlogs = async (req, res) => {
 try {
    const result = await pool.query("SELECT * FROM Blogs ORDER BY bDate DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching blogs:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all approved blogs
exports.getApprovedBlogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         b.*, 
         p."pnaam" || ' ' || p."pvan" AS author
       FROM Blogs b
       JOIN Person p ON b."pid" = p."pid"
       WHERE b."bstatus" = 'Approved'
       ORDER BY b."bdate" DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching approved blogs:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get blog details
exports.getBlogDetails = async (req, res) => {
  const { bid } = req.params;
  try {
    const result = await pool.query(`   SELECT 
         b.*, 
         p."pnaam" || ' ' || p."pvan" AS author
       FROM Blogs b
       JOIN Person p ON b."pid" = p."pid"
       WHERE bId = $1`, [bid]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching blogs:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
// Add a new blog
exports.addBlog = async (req, res) => {
  try {
    const {
      bTitle,
      bCategory,
      bDescription,
      bStory,
      pID,
      bTags,
      bStatus,
      bStatusMessage,
    } = req.body;

    // image handling
    const imagePath = req.file ? `/uploads/blogs/${req.file.filename}` : null;

    // tags handling (expecting array or comma-separated string)
    let tagsArray = [];
    if (bTags) {
      tagsArray = Array.isArray(bTags) ? bTags : bTags.split(",").map(t => t.trim());
    }

    const result = await pool.query(
      `INSERT INTO Blogs 
        (bTitle, bCategory, bDescription, bStory, pID, bImage, bTags, bStatus, bStatusMessage) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) 
       RETURNING *`,
      [
        bTitle,
        bCategory || null,
        bDescription || null,
        bStory || null,
        pID,
        imagePath,
        tagsArray,
        bStatus || "Pending",
        bStatusMessage || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding blog:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Update a blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      bTitle,
      bCategory,
      bDescription,
      bStory,
      pID,
      bTags,
      bStatus,
      bStatusMessage,
    } = req.body;

    // handle tags
    let tagsArray = [];
    if (bTags) {
      tagsArray = Array.isArray(bTags) ? bTags : bTags.split(",").map(t => t.trim());
    }

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/blogs/${req.file.filename}`;

      // delete old image if it exists
      const old = await pool.query("SELECT bImage FROM Blogs WHERE bId=$1", [id]);
      if (old.rows.length > 0 && old.rows[0].bimage) {
        const oldPath = path.join(__dirname, "..", old.rows[0].bimage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const result = await pool.query(
      `UPDATE Blogs SET 
        bTitle = COALESCE($1, bTitle),
        bCategory = COALESCE($2, bCategory),
        bDescription = COALESCE($3, bDescription),
        bStory = COALESCE($4, bStory),
        pID = COALESCE($5, pID),
        bImage = COALESCE($6, bImage),
        bTags = COALESCE($7, bTags),
        bStatus = COALESCE($8, bStatus),
        bStatusMessage = COALESCE($9, bStatusMessage),
        bDate = CURRENT_DATE
      WHERE bId = $10
      RETURNING *`,
      [
        bTitle,
        bCategory,
        bDescription,
        bStory,
        pID,
        imagePath,
        tagsArray.length > 0 ? tagsArray : null,
        bStatus,
        bStatusMessage,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error editing blog:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a blog
exports.deleteBlog = async (req, res) => {
 try {
    const { id } = req.params;

    // delete image from filesystem first
    const old = await pool.query("SELECT bImage FROM Blogs WHERE bId=$1", [id]);
    if (old.rows.length > 0 && old.rows[0].bimage) {
      const oldPath = path.join(__dirname, "..", old.rows[0].bimage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const result = await pool.query("DELETE FROM Blogs WHERE bId=$1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Error deleting blog:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};


