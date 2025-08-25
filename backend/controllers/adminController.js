const pool = require('../db');
const path = require('path');
const fs = require('fs');

// ✅ gets total farms, blogs, users and blogs with status "Pending"
exports.getAdminStats = async (req, res) => {
  try {
    const farmsResult = await pool.query("SELECT COUNT(*) AS total_farms FROM Farms");
    const blogsResult = await pool.query("SELECT COUNT(*) AS total_blogs FROM Blogs");
    const usersResult = await pool.query("SELECT COUNT(*) AS total_users FROM Person");
    const pendingBlogsResult = await pool.query("SELECT COUNT(*) AS pending_blogs FROM Blogs WHERE bStatus = 'Pending'");

    res.json({
      farms: farmsResult.rows[0].total_farms,
      blogs: blogsResult.rows[0].total_blogs,
      users: usersResult.rows[0].total_users,
      pendingBlogs: pendingBlogsResult.rows[0].pending_blogs
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

//✅ gets farm id, name, owner pNaam and pVan as owner 
exports.getFarms = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.fId, f.fName, p."pnaam" || ' ' || p."pvan" AS owner
      FROM Farms f
      LEFT JOIN Person p ON f.pId = p.pId
      ORDER BY f.fId DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching farms:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ gets person id, naam van as user, email, type, pBlocked, pAdmin, total reviews written
exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p."pid",
        p."pnaam" || ' ' || p."pvan" AS user,
        p."pemail" AS email,
        p."pcategory" AS type,
        p."pblocked",
        p."padmin",
        COUNT(r."rid") AS total_reviews
      FROM Person AS p
      LEFT JOIN Review AS r ON p."pid" = r."pid"
      GROUP BY p."pid", p."pnaam", p."pvan", p."pemail", p."pcategory", p."pblocked", p."padmin"
      ORDER BY p."pid" DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ error: "Server error" });
  }



};
//get blogs
exports.getBlogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b."bid", b."btitle", b."bstatus", p."pnaam" || ' ' || p."pvan" AS author
      FROM Blogs AS b
      LEFT JOIN Person AS p ON b."pid" = p."pid"
      ORDER BY b."bid" DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching blogs:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

//update blog status
exports.updateBlog = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const result = await pool.query(`
            UPDATE Blogs
            SET "bstatus" = $1
            WHERE "bid" = $2
            RETURNING *
        `, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Blog not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating blog:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};

// ✅ Toggle ban/unban for a user
exports.updateUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch current status first
    const checkUser = await pool.query(
      `SELECT "pblocked" FROM Person WHERE "pid" = $1`,
      [id]
    );

    if (checkUser.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentStatus = checkUser.rows[0].pblocked;
    const newStatus = !currentStatus; // toggle between true/false

    const result = await pool.query(
      `
      UPDATE Person
      SET "pblocked" = $1
      WHERE "pid" = $2
      RETURNING *
      `,
      [newStatus, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};


//get all reviews written by a user
exports.getUserReviews = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT r."rid", r."rstar", r."rdate", r."rdescription", f."fname", p."pemail", p."pnaam" || ' ' || p."pvan" AS user
      FROM Review AS r
      LEFT JOIN Farms AS f ON r."fid" = f."fid"
      LEFT JOIN Person AS p ON r."pid" = p."pid"
      WHERE r."pid" = $1 AND r."rdeleted" = false
      ORDER BY r."rdate" DESC
    `, [id]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user reviews:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

//set review as deleted =true
exports.updateUserReviews = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      UPDATE Review
      SET "rdeleted" = true
      WHERE "rid" = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error deleting review:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}