const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes'); 
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
//1.Set security HTTP headers
app.use(helmet());
//creating a middlewire to read data on a post method ... body

app.use(express.json({ limit: '10kb' })); //maximum 10kb data can be sent inside Request.body
/////////////////CUSTOM MIDDLEWARE

// //getting all tours from database
// app.get('/api/v1/tours', getAllTours);

// //creatig a new tour and sending it to database 

// app.post('/api/v1/tours', createTour);

// //getting only one tour via id .
// ///////////// ACCEPTING VARIABLE FROM URL
// app.get('/api/v1/tours/:id/', getTour);

// //patch
// app.patch('/api/v1/tours/:id',updateTour);
// app.delete('/api/v1/tours/:id',deleteTour);

//LIMIT Request from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an HOUR!',
});
app.use('/api', limiter);

//DATA sanitizatino agains NoSQL query injection
app.use(mongoSanitize());

//Data sanitization agains xss
app.use(xss());

//Prevent parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
////////////// MOUNTING ROUTER
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter); //middleware function
app.use('/api/v1/reviews',reviewRouter); 
//HANDLING UNHANDLED ROUTES.
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server.`
  // });
  ///////Better way of doing it.
  // const err = new Error(`Can't find ${req.originalUrl} on this server.`);
  // err.status = 'fail';
  // err.statusCode = 404;
  //////////////////BEST way of error handling.
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404)); //error is passed to next middleware succesfully . if any....
});

//GLOBAL ERROR HANDLING
app.use(globalErrorHandler);

module.exports = app;
