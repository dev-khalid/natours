const express = require('express');

const authController = require('../controllers/authController');

const userController = require('../controllers/userController');

const router = express.Router();
//thease routing does not follow rest api structure
/**@DESC following 5 middleware should be assesible by any user*/
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

//**As middleware runs in sequence so if we want to protect the following routes then it would be enough if i just put a middleware protection like this...  */
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);




router.use(authController.restrictTo('admin')); 
//FOLLOWING ROUTES WILL BE ONLY AVAILABLE TO LOGGED IN -> ADMIN ONLY . 
//REST API Structuring ...
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
