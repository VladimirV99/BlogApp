const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

let nameLengthChecker = (name) => {
  if (!name || name.length > 30)
    return false;
  return true;
};

let nameValidityChecker = (name) => {
  if(!name)
    return false;
  const nameRegExp = new RegExp(/^[a-zA-Z0-9'-]+$/);
  return nameRegExp.test(name);
}

const nameValidators = [
  {
    validator: nameLengthChecker,
    message: 'Name must be no more than 15 characters'
  },
  {
    validator: nameValidityChecker,
    message: 'Name must not have any special characters'
  }
];

let emailLengthChecker = (email) => {
  if (!email || email.length < 5 || email.length > 30)
    return false;
  return true;
};

let emailValidityChecker = (email) => {
  if (!email)
    return false;
  const emailRegExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  return emailRegExp.test(email);
};

const emailValidators = [
  {
    validator: emailLengthChecker,
    message: 'E-mail must be at least 5 characters but no more than 30'
  },
  {
    validator: emailValidityChecker,
    message: 'Must be a valid e-mail'
  }
];

let usernameLengthChecker = (username) => {
  if (!username || username.length < 3 || username.length > 15)
    return false;
  return true;
};

let usernameValidityChecker = (username) => {
  if (!username)
    return false;
  const usernameRegExp = new RegExp(/^[a-zA-Z0-9'-]+$/);
  return usernameRegExp.test(username);
};

const usernameValidators = [
  {
    validator: usernameLengthChecker,
    message: 'Username must be at least 3 characters but no more than 15'
  },
  {
    validator: usernameValidityChecker,
    message: 'Username must not have any special characters'
  }
];

let passwordLengthChecker = (password) => {
  if (!password || password.length < 8 || password.length > 35)
    return false;
  return true;
};

let passwordValidityChecker = (password) => {
  if (!password)
    return false;
  const passwordRegExp = new RegExp(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d]).{0,}$/);
  return passwordRegExp.test(password);
};

const passwordValidators = [
  {
    validator: passwordLengthChecker,
    message: 'Password must be at least 8 characters but no more than 35'
  },
  {
    validator: passwordValidityChecker,
    message: 'Must have at least one uppercase, lowercase, special character, and number'
  }
];

const UserSchema = mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    validate: nameValidators
  },
  last_name: {
    type: String,
    required: true,
    validate: nameValidators
  },
  photo: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: emailValidators
  },
  username: {
    type: String,
    required: true,
    unique: true,
    validate: usernameValidators
  },
  password: {
    type: String,
    required: true
  }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.findByUsername = function(username, callback){
  const query = {username: username};
  User.findOne(query, callback);
}

module.exports.encryptPassword = function(password, callback) {
  for(let i = 0; i < passwordValidators.length; i++){
    if(!passwordValidators[i].validator(password)){
      callback(passwordValidators[i].message, null);
      return;
    }
  }
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if(err) throw err;
      callback(null, hash);
      return;
    });
  });
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if(err) throw err;
    callback(null, isMatch);
  });
}

module.exports.register = function(newUser, callback){
  for(let i = 0; i < passwordValidators.length; i++){
    if(!passwordValidators[i].validator(newUser.password)){
      callback({password:{message:passwordValidators[i].message}});
      return;
    }
  }
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if(err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.login = function(username, password, callback) {
  if(username == null) {
    callback({message:'You must provide a username'})
  }
  if(password == null) {
    callback({message:'You must provide a password'});
  }
  User.findByUsername(username, (err, user) => {
    if(err) throw err;
    if(!user){
      console.log("test");
      callback({message:'Username not found'});
    }
    console.log(user);
    User.comparePassword(password, user.password, (err, isMatch) => {
      if(err) throw err;
      if(isMatch){
        const token = jwt.sign({user_id: user._id}, config.secret, {
          expiresIn: 604800 // 1 week
        });
        callback(null, {
          token: 'bearer ' + token,
          user: {
            id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            email: user.email,
            photo: user.photo
          }
        });
      } else {
        callback({message: 'Wrong password'});
      }
    });
  });
}