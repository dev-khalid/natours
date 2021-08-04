class AppError extends Error { 
  constructor(message,statusCode) { 
    super(message); 
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4')?'fail':'error'; //if the error starts with 4 then its a failiure otherwise it's a normal error . 
    this.isOperational = true;//the error is operational or not from mongoose. 
    Error.captureStackTrace(this,this.constructor); //whenever AppError class is created then it will store stackTrace-> means where the error occured.
  }
}
module.exports = AppError; 