const express = require('express');

const authController = require('../controllers/authController'); 

const userController = require('../controllers/userController');

const router = express.Router();
//thease routing does not follow rest api structure
router.post('/signup',authController.signup); 
router.post('/login',authController.login); 
router.post('/forgotPassword',authController.forgotPassword); 
router.patch('/resetPassword/:token',authController.resetPassword); 
router.patch('/updateMyPassword',authController.protect,authController.updatePassword); 

router.patch('/updateMe',authController.protect,userController.updateMe); 
router.delete('/deleteMe',authController.protect,userController.deleteMe); 

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
