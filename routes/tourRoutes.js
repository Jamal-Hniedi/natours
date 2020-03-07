const express = require('express');
const controller = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
const bookingRouter = require('./../routes/bookingRoutes');

const router = express.Router();
// router.param('id', controller.checkId);

router.use('/:tourId/reviews', reviewRouter);
router.use('/:tourId/bookings', bookingRouter);

router.route('/top-5')
    .get(controller.aliasTopTours,
        controller.getAllTours);

router.route('/tours-stats')
    .get(controller.getTourStats);

router.route('/monthly-plan/:year')
    .get(authController.protect,
        authController.restrictTo('admin', 'lead-guide', 'guide'),
        controller.getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(controller.getToursWithin);

router.route('/distances/:latlng/unit/:unit')
    .get(controller.getDistances);

router.route(`/`)
    .get(controller.getAllTours)
    .post(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        controller.createTour);

router.route(`/:id`)
    .get(controller.getTour)
    .patch(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        controller.uploadTourImages,
        controller.resizeTourImages,
        controller.updateTour)
    .delete(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        controller.deleteTour);
module.exports = router;