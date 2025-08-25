const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/stats', adminController.getAdminStats);

router.get('/farms', adminController.getFarms);

router.get('/blogs', adminController.getBlogs);


router.put('/blogs/:id', adminController.updateBlog);

router.get('/users', adminController.getUsers);

router.put('/users/:id', adminController.updateUser);

router.put('/users/reviews/:id', adminController.updateUserReviews);
router.get('/users/:id/reviews', adminController.getUserReviews);

module.exports = router;