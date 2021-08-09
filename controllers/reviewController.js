const AppError = require('../utils/AppError'); 
const catchAsync = require('../utils/catchAsync'); 
const Review = require('../models/reviewModel'); 
const factory = require('./handlerFactory'); 

exports.setTourUserIds = (req,res,next) => { 
  //Allow nested routes.
  if(!req.body.tour) req.body.tour = req.params.tourId; 
  if(!req.body.user) req.body.user = req.user._id; 
  next(); 
}
exports.getAllReviews = factory.getAll(Review); 
exports.getReview = factory.getOne(Review); 
exports.createReview = factory.createOne(Review); //setTourUserIds will be used here 
exports.updateReview = factory.updateOne(Review); 
exports.deleteReview = factory.deleteOne(Review); 

// exports.getAllReviews = catchAsync(async (req,res,next)=> { 
//   let filter = {}; 
//   if(req.params.tourId) filter = {tour: req.params.tourId}; 
//   const reviews = await Review.find(filter); 
   
//   res.status(200).json({
//     status: 'success',
//     results: reviews.length, 
//     data: {
//       reviews, 
//     }
//   })
// }); 
// exports.createReview = catchAsync(async (req,res,next)=> { 
//   /**
//    * req.body -> review: "abc",
//    * ratings: 4.5, 
//    * tourId: "5abasdf23234@", 
//    * userId: req.user._id-> we don't need to set it manually . 
//    */
//   //Allow the user to manually send user and tour id 
//   if(!req.body.user) req.body.user = req.user._id; 
//   if(!req.body.tour) req.body.tour = req.params.tourId; 
//   const review = await Review.create(req.body); 
//   res.status(201).json({
//     status: 'success',
//     data: {
//       review
//     }
//   })
// }); 