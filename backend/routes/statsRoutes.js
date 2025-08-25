const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Get all people
router.get('/personcount', statsController.getPersonCount);

// Get person by email
router.get('/farmcount', statsController.getFarmCount);

// Register new user
router.get('/speciescount', statsController.getSpeciesCount);

// User login
router.get('/articlecount', statsController.getArticlesCount);

module.exports = router;