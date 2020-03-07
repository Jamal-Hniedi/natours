const express = require('express');
const controller = require('./../controllers/viewController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/me', authController.protect, controller.getAccount);
router.get('/my-tours', authController.protect, controller.getMyTours);

router.use('/', authController.isLoggedIn);

router.get('/', controller.getOverview);
router.get('/tour/:slug', controller.getTour);
router.get('/login', controller.getLoginForm);
router.post('/submit-user-data', authController.protect, controller.updateUserData);

module.exports = router;