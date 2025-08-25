const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');

// Get all people
router.get('/', personController.getPeople);

// Get person by email
router.get('/:id', personController.getPersonByEmail);

// Register new user
router.post('/signup', personController.signup);

// User login
router.post('/login', personController.login);

router.put('/update/:id', personController.updatePerson);

router.put('/updatepassword/:id', personController.updatePassword);

router.put('/updatenotifications/:id', personController.updateNotifications);

module.exports = router;
