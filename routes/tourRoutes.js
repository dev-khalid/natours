const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    // authController.restrictTo('admin'),
    tourController.deleteTour
  );
module.exports = router;

////////////////////////////////PREVIOUS STUDY REFERENCE//////////////////////
// router.param('id', tourController.checkId);

// //Create a checkbody middlware
// //check if body contains the name and the price property
// //if not, send back 400(bad request)
// //add it to the post handler stack
// router
//   .route('/')
//   .get(tourController.getAllTours)
//   .post(tourController.checkBody, tourController.createTour);

// router
//   .route('/:id')
//   .get(tourController.getTour)
//   .patch(tourController.updateTour)
//   .delete(tourController.deleteTour);
// module.exports = router;
