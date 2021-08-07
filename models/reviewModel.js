//review/rating/createdAt/ref to user /ref to tour.
/**@DESC Review collection is a child of Tour Collection and also User Collection. that means it holds the reference to user_id and tour Id so that later on it can populate those data based on those ids.  */
const mongoose = require('mongoose');

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
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
