//review/rating/createdAt/ref to user /ref to tour.
/**@DESC Review collection is a child of Tour Collection and also User Collection. that means it holds the reference to user_id and tour Id so that later on it can populate those data based on those ids.  */
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    //object of options.
    review: {
      type: String,
      required: [true, 'Rating can not be empty'],
      trim: true,
    },
    rating: {
      type: Number,
      min: [1, 'You can not leave a review below 1'],
      max: [5, 'You can not leave a review more then 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user. '],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour. '],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// //this function will run each time after a new document is created .
// reviewSchema.pre('save',function(next){
//   if(!this.isNew) return next(); //if this document is not newly created then we just return this.
//   this.createdAt = Date.now();
//   next();
// });
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: "name"
  // }).
  this.populate({
    path: 'user', //to populate user data using user values inside review collection.
    select: 'name photo', //only selects the specified fields.
  });
  next();
});
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour', //we are grouping results based on tour field. for each unique tour|tourId it will put them all together.
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAveragge: stats[0].avgRating,
    });
  } else { 
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAveragge: 4.5//this is the default rating. 
    });
  }
};
//one user can review one tour once only. 
reviewSchema.index({tour: 1,user: 1}, {unique: true});//this combined index is used for unique user+tour combination. 
//that means a user + tour combo should be unique each time. 
//After saving a new review the tour-review statistics should be changed.
reviewSchema.post('save', function (next) {
  /** this points to current review document so there we will get access to this.tour
   * this.constructor points to Review model.
   * Review.calcAverageRating == this.constructor.calcAverageRating
   */
  this.constructor.calcAverageRatings(this.tour);
  next();
});

/**After updating or deleting a review the review statistics should be re-calculated.
 * findByIdAndUpdate
 * findByIdAndDelete
 * above two functions are used on mongoose but behind the scene mongoose use findOneAndUpdate/findOneAndDelete so we can use those two hooks.
 */
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne(); // Here this.r is current reviewDocument.
  //this.r is used so that we can get access to this r-> document to the post middleware. why we need this r there? cause on post middleware we need the document but the document query is already executed so we can not run await this.findOne() there. 
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  //in a post middleware we dont have access to next()
  await this.r.constructor.calcAverageRatings(this.r.tour); //here this.r.tour == tourId
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
