const pool = require("../db");
const cloudinary = require("../cloudinary");
exports.getAllFarms = async (req, res) => {
  try {
    const farmQuery = `
      SELECT f.fid, f.fname, f.fprovince, f.fdescription, f.fcategory,
             f.fdailyrate, f.fphone, f.femail, f.fwebsite, f.fadress, f.fgps,
             f.ffacilities, f.pid,
             COALESCE(
               json_agg(DISTINCT fi.fimagepath) FILTER (WHERE fi.fimagepath IS NOT NULL), 
               '[]'
             ) AS images,
             COALESCE(
               json_agg(DISTINCT jsonb_build_object(
                 'species', d.dtipe,
                 'malePrice', fd.fdmaleprice,
                 'femalePrice', fd.fdfemaleprice
               )) FILTER (WHERE d.dtipe IS NOT NULL),
               '[]'
             ) AS gamepricing,
             COALESCE(ROUND(AVG(r.rstar)::numeric, 1), 0) AS avg_rating
      FROM farms f
      LEFT JOIN farmsimage fi ON f.fid = fi.fid
      LEFT JOIN farmsdeer fd ON f.fid = fd.fid
      LEFT JOIN deer d ON fd.did = d.did
      LEFT JOIN review r ON f.fid = r.fid
      GROUP BY f.fid;
    `;
    const result = await pool.query(farmQuery);
    const farms = result.rows.map((row) => {
      const [lat, lon] = row.fgps ? row.fgps.split(",") : [null, null];
      return {
        id: row.fid,
        name: row.fname,
        location: row.fprovince,
        rating: parseFloat(row.avg_rating) || 0,
        lastUpdated: new Date().toISOString().split("T")[0],
        description: row.fdescription,
        categories: row.fcategory || [],
        amenities: row.ffacilities || [],
        images: row.images || [],
        contact_info: {
          phone: row.fphone,
          email: row.femail,
          website: row.fwebsite,
        },
        pricing: {
          dailyRate: row.fdailyrate || 0,
          gamePricing: row.gamepricing || [],
        },
        gpsCoordinates: {
          latitude: lat,
          longitude: lon,
        },
      };
    });
    res.json(farms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error fetching farms");
  }
};

exports.getFarmsByOwner = async (req, res) => {
  const ownerId = req.params.pId;
  try {
    const farmQuery = `
      SELECT f.fid, f.fname, f.fprovince, f.fdescription, f.fcategory,
             f.fdailyrate, f.fphone, f.femail, f.fwebsite, f.fadress, f.fgps,
             f.ffacilities, f.pid,
             COALESCE(
               json_agg(DISTINCT fi.fimagepath) FILTER (WHERE fi.fimagepath IS NOT NULL), 
               '[]'
             ) AS images,
             COALESCE(
               json_agg(DISTINCT jsonb_build_object(
                 'species', d.dtipe,
                 'malePrice', fd.fdmaleprice,
                 'femalePrice', fd.fdfemaleprice
               )) FILTER (WHERE d.dtipe IS NOT NULL),
               '[]'
             ) AS gamepricing,
             COALESCE(ROUND(AVG(r.rstar)::numeric, 1), 0) AS avg_rating
      FROM farms f
      LEFT JOIN farmsimage fi ON f.fid = fi.fid
      LEFT JOIN farmsdeer fd ON f.fid = fd.fid
      LEFT JOIN deer d ON fd.did = d.did
      LEFT JOIN review r ON f.fid = r.fid
      WHERE f.pid = $1
      GROUP BY f.fid;
    `;
    const result = await pool.query(farmQuery, [ownerId]);
    const farms = result.rows.map((row) => {
      const [lat, lon] = row.fgps ? row.fgps.split(",") : [null, null];
      return {
        id: row.fid,
        name: row.fname,
        location: row.fprovince,
        rating: parseFloat(row.avg_rating) || 0,
        lastUpdated: new Date().toISOString().split("T")[0],
        description: row.fdescription,
        categories: row.fcategory || [],
        amenities: row.ffacilities || [],
        images: row.images || [],
        contact_info: {
          phone: row.fphone,
          email: row.femail,
          website: row.fwebsite,
        },
        pricing: {
          dailyRate: row.fdailyrate || 0,
          gamePricing: row.gamepricing || [],
        },
        gpsCoordinates: {
          latitude: lat,
          longitude: lon,
        },
      };
    });
    res.json(farms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error fetching farms");
  }
};

exports.getFarmDetails = async (req, res) => {
  const farmId = req.params.fId;
  try {
    // Step 1: Farm Details + Average Stars
    const farmQuery = `
      SELECT f.fid, f.fname, f.fprovince, f.fdescription, f.fcategory, f.fdailyrate,
             f.fphone, f.femail, f.fwebsite, f.fadress, f.fgps, f.ffacilities, f.pid,
             COALESCE(ROUND(AVG(r.rstar)::numeric, 1), 0) AS avg_rating,
             COUNT(r.rstar) AS review_count
      FROM Farms f
      LEFT JOIN Review r ON f.fid = r.fid
      WHERE f.fid = $1
      GROUP BY f.fid;
    `;
    const farmRes = await pool.query(farmQuery, [farmId]);

    if (farmRes.rowCount === 0) {
      return res.status(404).send("Farm not found");
    }

    const farmDetails = farmRes.rows[0];

    // Step 2: Game species
    const deerQuery = `
      SELECT d.dtipe, fd.fdmaleprice, fd.fdfemaleprice
      FROM FarmsDeer fd
      JOIN Deer d ON fd.did = d.did
      WHERE fd.fid = $1;
    `;
    const deerRes = await pool.query(deerQuery, [farmId]);
    const gameList = deerRes.rows.map((row) => ({
      species: row.dtipe,
      malePrice: row.fdmaleprice,
      femalePrice: row.fdfemaleprice,
    }));

    // Step 3: Images
    const imagesQuery = `SELECT fimagepath FROM FarmsImage WHERE fid = $1;`;
    const imagesRes = await pool.query(imagesQuery, [farmId]);
    const images = imagesRes.rows.map((r) => r.fimagepath).filter(Boolean);

    // Step 4: Amenities
    let amenities = [];
    if (farmDetails.ffacilities) {
      if (Array.isArray(farmDetails.ffacilities)) {
        amenities = farmDetails.ffacilities;
      } else if (typeof farmDetails.ffacilities === "string") {
        amenities = farmDetails.ffacilities
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    // Step 5: Categories
    const categories = Array.isArray(farmDetails.fcategory)
      ? farmDetails.fcategory
      : farmDetails.fcategory
      ? [farmDetails.fcategory]
      : [];

    // Step 6: Reviews
    const reviewsQuery = `
      SELECT r.rid, r.rstar, r.rdescription, r.rdate, (p.pnaam || ' ' || p.pvan) AS author
      FROM Review r
      JOIN Person p ON r.pid = p.pid
      WHERE r.fid = $1 AND r.rdeleted = false
      ORDER BY r.rdate DESC;
    `;
    const reviewsRes = await pool.query(reviewsQuery, [farmId]);
    const reviews = reviewsRes.rows.map((r) => ({
      id: r.rid,
      author: r.author,
      rating: r.rstar,
      date: r.rdate,
      comment: r.rdescription,
    }));

    // Build final response
    const farmData = {
      id: farmDetails.fid,
      name: farmDetails.fname,
      province: farmDetails.fprovince,
      description: farmDetails.fdescription,
      categories,
      dailyRate: farmDetails.fdailyrate,
      phone: farmDetails.fphone,
      email: farmDetails.femail,
      website: farmDetails.fwebsite,
      address: farmDetails.fadress,
      fGPS: farmDetails.fgps,
      amenities,
      pID: farmDetails.pid,
      gameList,
      images,
      rating: parseFloat(farmDetails.avg_rating) || 0,
      reviewCount: parseInt(farmDetails.review_count, 10) || 0,
      reviews,
    };

    res.status(200).json(farmData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error fetching farm data");
  }
};

exports.addFarm = async (req, res) => {
  try {
    const {
      name,
      province,
      city,
      description,
      categories,
      gameList,
      dailyRate,
      phone,
      email,
      website,
      gpsCoordinates,
      amenities,
      userId,
    } = req.body;

    // Upload images to Cloudinary and collect URLs
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "hunting-website/farms",
            resource_type: "auto",
          });
          images.push(result.secure_url);
        } catch (error) {
          console.error("Error uploading to Cloudinary:", error);
          return res.status(500).send("Error uploading images");
        }
      }
    }
    const parsedGameList = JSON.parse(gameList); // Parse the gameList string
    const gps = gpsCoordinates ? JSON.parse(gpsCoordinates) : null;

    // Step 1: Insert Farm Data
    const insertFarmQuery = `
      INSERT INTO Farms (fName, fProvince, fDescription, fCategory, fDailyRate, fPhone, fEmail, fWebsite, fAdress, fGPS, fFacilities, pID)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING fId;
    `;
    const farmValues = [
      name,
      province,
      description,
      categories,
      parseFloat(dailyRate),
      phone,
      email,
      website,
      city,
      gps ? `${gps.latitude},${gps.longitude}` : null, // GPS as string
      amenities, // Insert amenities as an array
      userId || null, // Assuming userId can be null (for anonymous users)
    ];

    const farmRes = await pool.query(insertFarmQuery, farmValues);
    const farmId = farmRes.rows[0].fid;

    // Step 2: Handle Game Species (Deer) and Pricing
    for (const game of parsedGameList) {
      const gameSpecies = game.species; // Assuming game object has species, malePrice, and femalePrice
      const checkDeerQuery = "SELECT dId FROM Deer WHERE dTipe = $1 LIMIT 1;";
      const checkDeerRes = await pool.query(checkDeerQuery, [gameSpecies]);

      let did;

      if (checkDeerRes.rows.length > 0) {
        did = checkDeerRes.rows[0].did;
      } else {
        const insertDeerQuery =
          "INSERT INTO Deer (dTipe) VALUES ($1) RETURNING did;";
        const insertDeerRes = await pool.query(insertDeerQuery, [gameSpecies]);
        did = insertDeerRes.rows[0].did;
      }

      const insertGameQuery = `
        INSERT INTO FarmsDeer (fId, dId, fdMalePrice, fdFemalePrice)
        VALUES ($1, $2, $3, $4)
      `;
      await pool.query(insertGameQuery, [
        farmId,
        did,
        parseFloat(game.malePrice),
        parseFloat(game.femalePrice),
      ]);
    }

    // Step 3: Insert Cloudinary URLs into FarmsImage Table
    for (const imageUrl of images) {
      const insertImageQuery = `
        INSERT INTO FarmsImage (fId, fImagePath)
        VALUES ($1, $2) RETURNING fImageId;
      `;
      await pool.query(insertImageQuery, [farmId, imageUrl]);
    }

    res.status(200).json({ message: "Farm added successfully!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error adding farm data");
  }
};

exports.updateFarmDetails = async (req, res) => {
  const farmId = req.params.fId;
  try {
    let {
      name,
      province,
      city,
      description,
      categories,
      gameList,
      dailyRate,
      phone,
      email,
      website,
      gpsCoordinates,
      amenities,
      userId,
      keepImages,
    } = req.body;

    // Parse keepImages safely (should be an array of filenames)
    let parsedKeepImages = [];
    try {
      parsedKeepImages = keepImages ? JSON.parse(keepImages) : [];
    } catch (e) {
      parsedKeepImages = [];
    }

    // Parse JSON string fields
    const parsedGameList = gameList ? JSON.parse(gameList) : [];
    const gps = gpsCoordinates ? JSON.parse(gpsCoordinates) : null;

    // Upload new images to Cloudinary
    const newUploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "hunting-website/farms",
            resource_type: "auto",
          });
          newUploadedImages.push(result.secure_url);
        } catch (error) {
          console.error("Error uploading to Cloudinary:", error);
          return res.status(500).send("Error uploading images");
        }
      }
    }

    // --- Update Farm core info ---
    const updateFarmQuery = `
      UPDATE Farms
      SET
        fName = $1,
        fProvince = $2,
        fDescription = $3,
        fCategory = $4,
        fDailyRate = $5,
        fPhone = $6,
        fEmail = $7,
        fWebsite = $8,
        fAdress = $9,
        fGPS = $10,
        fFacilities = $11,
        pID = $12
      WHERE fId = $13
      RETURNING fId;
    `;
    const farmValues = [
      name,
      province,
      description,
      categories, // text[] literal like {A,B}
      parseFloat(dailyRate),
      phone,
      email,
      website,
      city,
      gps ? `${gps.latitude},${gps.longitude}` : null,
      amenities, // text[] literal like {X,Y}
      userId || null,
      farmId,
    ];

    const farmRes = await pool.query(updateFarmQuery, farmValues);
    if (farmRes.rowCount === 0) return res.status(404).send("Farm not found");

    // --- Upsert pricing per species ---
    for (const game of parsedGameList) {
      const gameSpecies = game.species;
      const checkDeerQuery = "SELECT dId FROM Deer WHERE dTipe = $1 LIMIT 1;";
      const checkDeerRes = await pool.query(checkDeerQuery, [gameSpecies]);

      let dId;
      if (checkDeerRes.rows.length > 0) {
        dId = checkDeerRes.rows[0].did || checkDeerRes.rows[0].dId;
        const updateSpeciesPricingQuery = `
          UPDATE FarmsDeer
          SET fdMalePrice = $1, fdFemalePrice = $2
          WHERE fId = $3 AND dId = $4
        `;
        await pool.query(updateSpeciesPricingQuery, [
          parseFloat(game.malePrice),
          parseFloat(game.femalePrice),
          farmId,
          dId,
        ]);
      } else {
        const insertDeerQuery =
          "INSERT INTO Deer (dTipe) VALUES ($1) RETURNING dId;";
        const insertDeerRes = await pool.query(insertDeerQuery, [gameSpecies]);
        dId = insertDeerRes.rows[0].did || insertDeerRes.rows[0].dId;
        const insertGameQuery = `
          INSERT INTO FarmsDeer (fId, dId, fdMalePrice, fdFemalePrice)
          VALUES ($1, $2, $3, $4)
        `;
        await pool.query(insertGameQuery, [
          farmId,
          dId,
          parseFloat(game.malePrice),
          parseFloat(game.femalePrice),
        ]);
      }
    }

    // --- Image handling ---
    // 1. Fetch current images from DB
    const existingRes = await pool.query(
      `SELECT fImagePath FROM FarmsImage WHERE fId = $1`,
      [farmId]
    );
    const existingImages = existingRes.rows.map((r) => r.fimagepath);

    // 2. Find images to delete (in DB but not in keepImages)
    const toDelete = existingImages.filter(
      (img) => !parsedKeepImages.includes(img)
    );

    if (toDelete.length > 0) {
      // Delete from Cloudinary first
      for (const imageUrl of toDelete) {
        try {
          // Extract public_id from Cloudinary URL
          const publicId = imageUrl
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error("Error deleting from Cloudinary:", error);
        }
      }

      // Then delete from database
      await pool.query(
        `DELETE FROM FarmsImage WHERE fId = $1 AND fImagePath = ANY($2::text[])`,
        [farmId, toDelete]
      );
    }

    // 3. Insert any newly uploaded images
    for (const imageUrl of newUploadedImages) {
      await pool.query(
        `INSERT INTO FarmsImage (fId, fImagePath) VALUES ($1, $2)`,
        [farmId, imageUrl]
      );
    }

    res.status(200).json({ message: "Farm updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating farm data");
  }
};

exports.deleteFarm = async (req, res) => {
  const farmId = req.params.fId;

  try {
    // Step 1: fetch farm images (so we can remove files from disk)
    const imagesRes = await pool.query(
      `SELECT fImagePath FROM FarmsImage WHERE fId = $1`,
      [farmId]
    );
    const images = imagesRes.rows.map((r) => r.fimagepath);

    // Step 2: delete the farm (cascades to FarmsImage, FarmsDeer, Review)
    const deleteFarmQuery = `DELETE FROM Farms WHERE fId = $1 RETURNING fId;`;
    const deleteRes = await pool.query(deleteFarmQuery, [farmId]);

    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ message: "Farm not found" });
    }

    // Step 3: delete files from Cloudinary
    for (const imageUrl of images) {
      try {
        // Extract public_id from Cloudinary URL
        const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
      }
    }

    res
      .status(200)
      .json({ message: "Farm and related data deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting farm");
  }
};

exports.addReview = async (req, res) => {
  const farmId = req.params.fid;
  const { userId, rating, comment } = req.body;

  try {
    // Step 1: Check if the farm exists
    const farmRes = await pool.query(`SELECT * FROM Farms WHERE fId = $1`, [
      farmId,
    ]);
    if (farmRes.rowCount === 0) {
      return res.status(404).json({ message: "Farm not found" });
    }

    // Step 2: Insert the review
    const reviewQuery = `
      INSERT INTO Review (fid, pid, rstar, rdescription)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const reviewRes = await pool.query(reviewQuery, [
      farmId,
      userId,
      rating,
      comment,
    ]);

    res.status(201).json({
      message: "Review added successfully",
      review: reviewRes.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding review");
  }
};
