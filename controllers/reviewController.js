const Review = require('./../models/reviewModel');
const Booking = require('./../models/bookingModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.setIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

exports.hasBookedTour = catchAsync(async (req, res, next) => {
    const booking = await Booking.findOne({
        user: req.body.user,
        tour: req.body.tour
    });
    if (!booking) return next(new AppError('You cannot review a tour you didn\'t book', 400));
    next();
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);