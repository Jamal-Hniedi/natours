const stripe = require('stripe')(process.env.STRIPE_SK);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // Get tour
    const tour = await Tour.findById(req.params.tourId);
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours`,
        cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`http://www.natours.dev/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    });
    // Send checkout session to client
    res.status(200).json({
        status: 'success',
        session
    });
});

const createBookingCheckout = async (session) => {
    const tour = session.client_reference_id;
    const user = (await User.findOne(session.customer_email)).id;
    const price = session.line_items[0].amount / 100;
    await Booking.create({tour, user, price});
};

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers('stripe-signature');
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SK);
    } catch (err) {
        return res.status().send(`Webhook error:${err.message}`)
    }

    if (event.type === 'checkout.session.complete')
        createBookingCheckout(event.data.object);
    res.status(200).json({received: true});
};

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);