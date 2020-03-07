const express = require('express');
const controller = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({mergeParams: true});

router.use(authController.protect);

router.route('/')
    .get(controller.getAllReviews)
    .post(authController.restrictTo('user'),
        controller.setIds,
        controller.hasBookedTour,
        controller.createReview);

router.route('/:id')
    .get(controller.getReview)
    .patch(authController.restrictTo('admin', 'user'),
        controller.updateReview)
    .delete(authController.restrictTo('admin', 'user'),
        controller.deleteReview);

module.exports = router;