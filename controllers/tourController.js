const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  //it's a middleware function that just work with request object and it modifies the request object.
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, //we are grouping the matched doc based on difficulty-> means we are calculating how much tours are there with dificulty EASY,MIDIUM,DIFFICULT. 
        num: { $sum: 1 }, //here we are adding one for each matched document
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',//unwind will spread the data based on this field. 
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },//dates er month er upor depend kore data gula grouping kora hobe. 
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0, //this value can be 0 / 1
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});
// exports.createTour = catchAsync(async (req, res, next) => {
//   //const newTour = new Tour({});newTour.save()
//   // try {
//   const newTour = await Tour.create(req.body); //successfully created a document on db
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
//   // }
//   // catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: 'Invalid Data Sent! ',
//   //   });
//   // }
// });

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // try {
//   /////////////HERE WE ARE NOW USING CLASS BASED APIFEATURES
//   //   //1(A).Filtering
//   //   const queryObj = { ...req.query };//url?search=5 req.query = {search: 5}
//   //   const excludeFields = ['page', 'limit', 'sort', 'fields'];
//   //   excludeFields.forEach((el) => delete queryObj[el]);

//   //   //1(B).Advanced Filtering
//   //   let queryStr = JSON.stringify(queryObj);
//   //   queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//   //   let query = Tour.find(JSON.parse(queryStr));

//   //   // 2. Sorting
//   //   if (req.query.sort) {
//   //     const sortBy = req.query.sort.split(',').join(' ');
//   //     query = query.sort(sortBy);
//   //   } else {
//   //     query = query.sort('-createdAt');
//   //   }

//   //   //3.Field limiting
//   //   if (req.query.fields) {
//   //     const fields = req.query.fields.split(',').join(' ');
//   //     query = query.select(fields);
//   //   } else {
//   //     query = query.select('-__v');//default selection
//   //   }
//   //   //4.Pagination
//   //   const page = req.query.page * 1 || 1;
//   //   const limit = req.query.limit * 1 || 100; //this number of doc should be presented on each api call
//   //   const skip = (page - 1) * limit; //this number of document's should be skipped first
//   //   if (req.query.page) {
//   //     const numTours = await Tour.countDocuments();
//   //     if (skip >= numTours) throw new Error('This page does not exist!');
//   //   }
//   //   query = query.skip(skip).limit(limit);
//   //   //EXECUTATION OF QUERY
//   //   const tours = await query;

//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();

//   const tours = await features.query;
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });

// exports.getTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   // .populate({
//   //   path: 'guides',
//   //   select: '-__v -passwordChangedAt' //minus sign means that this will select all field but fields with (-) sign .
//   // });
//   //Could have tried something like : Tour.findOne({filter object})
//   if (!tour) {
//     return next(new AppError('Could not found tour with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });
// exports.updateTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError('Could not found tour with that ID', 404));
//   }
//   //Could have tried something like : Tour.findOne({filter object})
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   //Could have tried something like : Tour.findOne({filter object})
//   if (!tour) {
//     return next(new AppError('Could not found tour with that ID', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// } catch (err) {
//   res.status(404).json({
//     status: 'fail',
//     message: err,
//   });
// }
// });

///////////////////////////////////PREVIOUS STUDY RECORD//////////////////////////////
// // const fs = require('fs');

// // //read data from the file tours
// // const tours = JSON.parse(
// //   fs.readFileSync(`${__dirname}/../dev-data/data/tours-sample.json`)
// // );
// //json.parse() -> parse the data in javascript object formet .
// exports.checkId = (req, res, next, val) => {
//   // if (req.params.id * 1 > tours.length) {
//   //   return res.status(404).json({
//   //     status: 'fail',
//   //     message: 'Invalid ID',
//   //   });
//   // }
//   next(); //as it's a middleware we need to call a next()
// };
// exports.checkBody = (req,res,next) => {
//   const data = req.body;
//   if(!data.price||!data.name) {
//     return res.status(400).json({
//       status: 'Fail',
//       message: 'Bad Request'
//     })
//   }

//   next();
// }
// /////////////////// ROUTE HANDLER FUNCTIONS FOR TOUR SECTION
// exports.getAllTours = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     requestedAt: req.requestTime,
//     // results: tours.length,
//     // data: {
//     //   tours,
//     // },
//   });
// };
// exports.createTour = (req, res) => {
//   // const newId = tours[tours.length - 1].id + 1;
//   // const newTour = Object.assign({ id: newId }, req.body); //it merge two object and return a new one
//   // tours.push(newTour);
//   // fs.writeFile(
//   //   `${__dirname}/dev-data/data/tours-sample.json`,
//   //   JSON.stringify(tours),
//   //   (err) => {
//   //     res.status(201).json({
//   //       status: 'success',
//   //       data: {
//   //         tour: newTour,
//   //       },
//   //     });
//   //   }
//   // );
//   // //res.send('Posting is done. and read data via express.json() middlewire');
// };

// exports.getTour = (req, res) => {
//   // //here in the url we have a optional parameter . :x?
//   // const id = +req.params.id;
//   // const tour = tours.find((el) => el.id === id);
//   // // if (!tour) {
//   // //   return res.status(404).json({
//   // //     status: 'Fail',
//   // //     message: 'Invalid ID',
//   // //   });
//   // // }

//   // res.status(200).json({
//   //   status: 'success',
//   //   data: {
//   //     tour,
//   //   },
//   // });
// };

// exports.updateTour = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: '<Updated the tour>',
//     },
//   });
// };
// exports.deleteTour = (req, res) => {
//   // if (req.params.id * 1 > tours.length) {
//   //   return res.status(404).json({
//   //     status: 'fail',
//   //     message: 'Invalid ID',
//   //   });
//   // }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// };
