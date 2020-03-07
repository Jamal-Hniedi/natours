const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const path = require('path');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const URL = '/api/v1';

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set SECURITY HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'development')
    app.use(morgan('dev'));

// Limit # of requests from same IP
const limiter = rateLimit({
    // 100 REQUESTS from one IP every 1 HOUR
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too money requests from this IP! Please try again later!'
});
app.use('/api', limiter);

// Parse body
app.use(express.json({limit: '10kb'}));
app.use(cookieParser());
// Parse encoded data from HTML FORM
app.use(express.urlencoded({extended: true, limit: '10kb'}));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent params pollution
app.use(hpp({
    whitelist: [
        'duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize',
        'difficulty', 'price'
    ]
}));

app.use(`/`, viewRouter);
app.use(`${URL}/tours`, tourRouter);
app.use(`${URL}/users`, userRouter);
app.use(`${URL}/reviews`, reviewRouter);
app.use(`${URL}/bookings`, bookingRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
