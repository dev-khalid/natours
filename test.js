const express = require('express'); 

const tourRouter=require(`./routes/tourRoutes.js`); 
const userRouter=require('./routes/userRoutes'); 

const app = express(); //here we are creating an instance . inside express we have access to http.. 


///////////////*****App.use() thease functions are middlewares. when a request is made on app then this functions are called and the middlewares gets executed or called.  */
app.use(express.json());//here we are using this express.json() file so that we can read data from req.body

//mounting the router
app.use('api/v1/tours',tourRouter); 
app.use('api/v1/users',userRouter); 

// app.listen(3000,'localhost',()=> {
//   console.log('Listening on port 3000')
// })