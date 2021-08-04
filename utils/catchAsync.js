module.exports = (fn) => ((req, res, next) => {
    fn(req, res, next).catch(next);//err object is passed automatically to next function if any
  }
);
