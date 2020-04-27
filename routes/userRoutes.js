const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);


router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/update',
    userController.uploadUserPhoto,
    userController.resizePhoto,
    userController.updateMe);
router.delete('/delete', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router
    .route(`/`)
    .get(userController.getAllUsers)
    .post(userController.createUser);
router
    .route(`/:id`)
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
