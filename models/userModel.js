const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//name,email,photo,password,passwordConfirm
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Must have a name'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: 'Email address is required',
    validate: [validator.isEmail, 'Please fill a valid email address'],
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: 'Please Enter a password with at least 6 characters.',
    minLength: 6,
    select: false, //it will not be selected whenevery any query is done on a collection created with this schema.
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    //valdator function only works at the time of CREATE and SAVE.
    //so don't use it at the time of update.
    validate: {
      validator: function (currentElement) {
        return currentElement === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
//whenever a document is created or a password is modified then this password encryption function will work before saving.
//Password Hashing

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified.
  //isModified is a build in function on mongodb/mongoose.
  if (!this.isModified('password')) return next();

  //Hash the password with cpu cost of 10
  this.password = await bcrypt.hash(this.password, 10);

  //Delete passwordConfirmed field
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password' || this.isNew)) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});
//Creating an instance of documents. .
//We can call instance methods on a document created with userSchema
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//checking if the password has been changed after a jwt is issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp; //if it's false then ok 200 < 100
  }

  //False means not changed
  return false;
};

//create token for password resseting
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); //stored hashed token on db.
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //password expires in 10 minutes.
  return resetToken; //it's a plain text in hex formet
};
const User = mongoose.model('User', userSchema);
module.exports = User;
