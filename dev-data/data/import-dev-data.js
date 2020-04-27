require('dotenv').config({path: './config.env'});
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

mongoose
    .connect(process.env.DATABASE_LOCAL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => console.log('DB connected successfully!'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

const importData = async () => {
    try {
        await Review.create(reviews);
        console.log('Data imported');
    } catch (err) {
        console.error(err);
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await Review.deleteMany();
        console.log('Data deleted');
    } catch (err) {
        console.error(err);
    }
    process.exit();
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
