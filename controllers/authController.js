const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');
const AppError = require('../utils/AppError');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
const createSendToken = (user,statusCode,res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*86400), 
    httpOnly: true, //send the cookie via http only 
  }
  if(process.env.NODE_ENV === 'production') cookieOptions.secure = true; 

  res.cookie('JWT',token,cookieOptions); 

  //Remove Password 
  user.password = undefined; 

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
}
exports.signup = catchAsync(async (req, res, next) => {
  //we are not validating that much ..

  // this way of creating new object from req.body helps us to prevent someone entered role: 'admin' like thing.
  //in this way we are not accepting other properties sent inside request body....
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    //role: req.body.role//don't write this line of code . cause it will give anyone power to make themself admin.
  });

  //creating token
  createSendToken(newUser,201,res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1.check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!'));
  }
  //2.check if user exists && password is correct
  const user = await User.findOne({ email: email }).select('+password'); //if any field is selected false by default then we need to select it with an additional +sign before the field name.

  //if the user does not exist then it will be an issue .. that's why i am commenting out the following line of code.
  // const correct = await user.correctPassword(password,user.password);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password!', 401));
  }
  //3. if everything is ok, send token to client
  createSendToken(user,200,res); 
});
exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2) Verification token
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //Here we are checking that if the token and the payload matches with the current token or not.
  //Decoded value will be actually the payload object itself.
  // console.log(decoded);
  //3. Check if user still exists.
  //In this case let's think about an user whose password was changed cause his account was stolen and he changed his password to secure his id . So now if we don't check user's existance then it will run our codes bug and vulnarability.
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exists',
        401
      )
    );
  }
  //4. Check if user changed password after the token was issued.
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again.', 401)
    ); //if we are returning something manually then we need to call it with next otherwise the middleware will never go to the next one. cause we are breaking the flow here.
  }

  //Grant Access to protected Route.
  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  //roles is an array
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action!', 403)
      );
      //403-forbidden.
    }

    next();
  };
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1.Get user based on posted email.
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user found with this email.', 404));
  }
  //2.Generate the random reset token.
  const resetToken = user.createPasswordResetToken(); //this will create the reset token which we will send it via email .
  await user.save({ validateBeforeSave: false }); //turning off all the validation.
  //3.Send it to user's email.
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH Request with your new pass and passwordConfirm to ${resetURL}.\nIf you didn't forget your password, please ignot this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password Reset token(valid for 10 min)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the email.Try again later!', 500)
    );
  }
  next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1.Get user based on the token.
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2.If the token ahs not expired and user exists,set new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3.Updated changedPasswordAt property on database.
  //Log the user in . Send jwt to user.
  createSendToken(user,200,res); 
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1. Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //2.check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  //3.if so , update password.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); //so that pre-save middle ware functions can run .

  //4.Log user in send Jwt
  createSendToken(user,200,res); 
});
