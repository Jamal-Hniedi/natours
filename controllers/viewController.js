const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

exports.getOverview = catchAsync(async (req, res) => {
    // Get tours
    const tours = await Tour.find();
    // Render template
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    });
});
exports.getTour = catchAsync(async (req, res, next) => {
    const slug = req.params.slug;
    const tour = await Tour.findOne({slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    if (!tour) return next(new AppError('No tour with that name!', 404));
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});
exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log in'
    });
};
exports.getAccount = (req, res) => {
    res.status(200)
        .render('account', {
            title: 'My account'
        });
};
exports.updateUserData = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    });
    res.status(200)
        .render('account', {
            title: 'My account',
            user
        });
});
exports.getMyTours = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({user: req.user.id});
    const toursIds = bookings.map(el => el.tour);
    const tours = await Tour.find({_id: {$in: toursIds}});
    res.status(200).render('overview', {
        title: 'My tours',
        tours
    });
});
