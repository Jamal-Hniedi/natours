const mongoose = require('mongoose');
const Tour = require('./tourModel');

const schema = new mongoose.Schema({
        review: {
            type: String,
            required: [true, 'Review cannot be empty!']
        },
        rating: {
            type: Number,
            min: [1, 'Rating is between 0 and 5!'],
            max: [5, 'Rating is between 0 and 5!']
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour!']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user!']
        }
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    });

schema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

schema.statics.calcAverageRatings = async function (tourId) {
    // this points to the model
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                ratingsQuantity: {$sum: 1},
                ratingsAverage: {$avg: '$rating'}
            }
        }
    ]);
    if (stats.length > 0)
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: stats[0].ratingsAverage,
            ratingsQuantity: stats[0].ratingsQuantity
        });
    else await Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: 0,
        ratingsQuantity: 0
    });
};

schema.post('save', async function () {
    // this points to the current doc
    await this.constructor.calcAverageRatings(this.tour);
});

schema.pre(/^findOneAnd/, async function (next) {
    this.review = await this.findOne();
    next();
});

schema.post(/^findOneAnd/, async function () {
    await this.review.constructor.calcAverageRatings(this.review.tour);
});

const Review = mongoose.model('Review', schema);

module.exports = Review;