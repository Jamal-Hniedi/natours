const {promisify} = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');
const Email = require('./../utils/email');
const crypto = require('crypto');

const cookieOptions = {
    expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
};

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};
const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    cookieOptions.secure = req.secure || req.get('x-forwarded-proto') === 'https';
    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;
    user.active = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role))
            return next(
                new AppError(
                    "You don't have permission to perform this action!!",
                    403
                )
            );
        next();
    };
};

exports.signup = catchAsync(async (req, res, next) => {
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    new Email(user, url).sendWelcome();
    createSendToken(user, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
    if (!email || !password)
        return next(new AppError('Please provide email and password!'), 400);
    const user = await User.findOne({email}).select('+password');
    if (!user || !(await user.correctPassword(password, user.password)))
        return next(new AppError('Incorrect email or password!'), 401);
    createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'logged out', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
};

exports.isLoggedIn = async (req, res, next) => {
    try {
        if (!req.cookies.jwt) return next();
        const decoded = await promisify(jwt.verify)(
            req.cookies.jwt,
            process.env.JWT_SECRET
        );
        const user = await User.findById(decoded.id);
        if (!user && user.changedPasswordAfter(decoded.iat)) return next();
        // Pug have access to res.locals
        res.locals.user = user;
        next();
    } catch (err) {
        return next();
    }
};

exports.protect = catchAsync(async (req, res, next) => {


    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer'))
        token = req.headers.authorization.split(' ')[1];
    else if (req.cookies.jwt) token = req.cookies.jwt;
    else
        return next(new AppError('Please log in to get access!'), 401);
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user)
        return next(
            new AppError(
                "The user belonging to this token doesn't exist any more!"
            ),
            401
        );
    if (user.changedPasswordAfter(decoded.iat))
        return next(
            new AppError(
                'Password has been changed recently! Please log in again!'
            ),
            401
        );
    req.user = user;
    res.locals.user = user;
    next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // Get user
    const user = await User.findOne({email: req.body.email});
    if (!user)
        return next(
            new AppError(
                'There is no user with the provided email address!',
                404
            )
        );

    // Generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});
    // Send token back

    try {
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status: 'success',
            message: 'Token has been sent to your mail box! '
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});
        return next(new AppError('There was an error! Try again later'), 500);
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // Get user
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
    });

    // If token !expired set new password
    if (!user)
        return next(new AppError('Token is invalid or has expired!'), 400);
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Update passwordChangedAt

    // Log the user in
    createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // Get user
    const user = await User.findById(req.user.id).select('+password');
    if (!user)
        return next(
            new AppError(
                'There is no user with the provided email address!',
                404
            )
        );
    // Check if password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
        return next(new AppError('Incorrect password!', 401));
    // Update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // Log user in
    createSendToken(user, 200, req, res);
});
