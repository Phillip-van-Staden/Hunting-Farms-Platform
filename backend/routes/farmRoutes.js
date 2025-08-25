const express = require('express');
const router = express.Router();
const FarmController = require('../controllers/FarmController');
const multer = require('multer');
const path = require('path');

// Setup multer for image file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// GET all farms
router.get('/', FarmController.getAllFarms);

// GET farms by owner
router.get('/:pId/owner', FarmController.getFarmsByOwner);

// GET farm details
router.get('/:fId/farmdetails', FarmController.getFarmDetails);

// POST add farm
router.post('/addfarm', upload.array('images', 10), FarmController.addFarm);

// PUT update farm details
router.put('/:fId/farmdetails', upload.array('images', 10), FarmController.updateFarmDetails);

// DELETE farm
router.delete('/:fId', FarmController.deleteFarm);

// POST add review
router.post('/:fid/review', FarmController.addReview);

module.exports = router;