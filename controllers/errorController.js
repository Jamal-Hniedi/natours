const AppError = require('./../utils/AppError');

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        console.error(err);
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack
        });
    } else {
        console.error(err);
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }
};
const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            console.error(err);
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }

        console.error(err);
        res.status(500).json({
            status: 'error!',
            message: 'Something went wrong!'
        });
    } else {
        if (err.isOperational) {
            console.error(err);
            return res.status(err.statusCode).render('error', {
                title: 'Something went wrong!',
                msg: err.message
            });
        }

        console.error(err);
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: 'Please try again later'
        });
    }
};

const handleCastError = err => {
    const msg = `Invalid ${err.path}: ${err.value}!`;
    return new AppError(msg, 400);
};

const handleDuplicateFieldError = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const msg = `Duplicate field value ${value}.Please use another name!`;
    return new AppError(msg, 400);
};
const handleValidationError = err => {
    const errors = Object.values(err.errors).map(value => value.message);
    const msg = `Invalid input data! ${errors.join('. ')}`;
    return new AppError(msg, 400);
};
const handleJWTError = () =>
    new AppError('Invalid token! Please log in again!', 401);
const handleJWTExpiredError = () =>
    new AppError('Expired token! Please log in again!', 401);

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;
        if (error.name === 'CastError') error = handleCastError(error);
        if (error.code === 11000) error = handleDuplicateFieldError(error);
        if (error.name === 'ValidationError')
            error = handleValidationError(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, req, res);
    }
};
