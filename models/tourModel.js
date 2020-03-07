const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');

const tourSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'A tour must have a name!'],
            unique: true,
            trim: true
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration!']
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size!']
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have difficulty!'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either easy, medium, difficult!'
            }
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price!']
        },
        priceDiscount: {
            type: Number,
            validate: {
                // runs only on create
                // NOT GONNA RUN ON UPDATE
                validator: function (value) {
                    return value <= this.price;
                },
                message: 'Discount ({VALUE}) cannot be greater than the price itself!'
            }

        },
        ratingsAverage: {
            type: Number,
            default: 0,
            min: [0, 'Rating must be above 0.0'],
            max: [5, 'Rating must be below 5.0'],
            set: value => Math.round(value * 10) / 10
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
            min: [0, 'Ratings count must be above 0']
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a summary!']
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image!']
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        startDates: [Date],
        secret: {
            type: Boolean,
            default: false
        },
        startLocation: {
            // Geo JSON
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        locations: [
            {
                type: {
                    type: String,
                    enum: ['Point'],
                    default: 'Point'
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number
            }
        ],
        // Embedding
        /*
        guides: Array
         */
        // Referencing
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }
        ]
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    });

tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({startLocation: '2dsphere'});

tourSchema.virtual('durationWeeks')
    .get(function () {
        return this.duration / 7;
    });

// Virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

// Document middleware:
// runs before .save() and .create()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {lower: true});
    next();
});

// Embedding middleware
/*tourSchema.pre('save', async function (next) {
    const guidesPromises = this.guides.map(async id => await User.findById(id));
    this.guides = await Promise.all(guidesPromises);
    next();
});
*/

// Query middleware:
tourSchema.pre(/^find/, function (next) {
    this.find({secret: {$ne: true}});
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
});
// Aggregation middleware
/*
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({
        $match: {secret: {$ne: true}}
    });
    next();
});
*/

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;