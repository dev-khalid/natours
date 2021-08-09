const catchAsync = require('../utils/catchAsync'); 
const AppError = require('../utils/AppError'); 
const APIFeatures = require('../utils/apiFeatures'); 

exports.deleteOne = (Model) =>  catchAsync(async (req,res,next) => {
  const doc = await Model.findByIdAndDelete(req.params.id); //for deletion of any data we need a valid id inside params. 
  if(!doc) {
    return next(new AppError('No document found with this ID!',404)); 
  }
  res.status(204).json({
    status: 'success',
    data: null
  })
}); 

exports.updateOne = (Model) => catchAsync(async (req,res,next) => {
  if(req.body.password) return next(new AppError('This URL is not for password update. ',400)); //deny password changes. 
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body,{
    new: true, 
    runValidators: true
  }); 
  if(!doc) { 
    return next(new AppError('No Document found with that ID',404)); 
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  })
})

exports.createOne = (Model) => catchAsync(async (req,res,next) => {
  const doc = await Model.create(req.body); 
  res.status(201).json({
    status: 'success',
    data: {
      data: doc
    }
  })
})

exports.getOne = (Model,popOptions) => catchAsync(async (req,res,next)=> {
  let query = Model.findByIdAndDelete(req.params.id); 
  if(popOptions) query = query.populate(popOptions); 
  const doc = await query; 

  if(!doc) { 
    return next(new AppError('No document found with that ID',404)); 
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  })
})
exports.getAll = Model => catchAsync(async (req,res,next) => { 
  //To allow for nested GET reviews on tour (hack)
  let filter = {}; 
  if(req.params.tourId) filter = {tour: req.params.tourId}; 

  const features = new APIFeatures(Model.find(filter),req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate(); 
   const doc = await features.query; 
   res.status(200).json({
     status: 'success',
     results: doc.length, 
     data: {
       data: doc
     }
   })
  
})