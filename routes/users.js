const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');

const public_path = './public/';
const photo_path = 'uploads/';
const storage = multer.diskStorage({
  destination: public_path + photo_path,
  filename: function(req, file, callback){
    callback(null, req.user._id + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024*1024 },
  fileFilter: function(req, file, callback){
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if(extname && mimetype) {
      callback(null, true);
    } else {
      callback('Images Only');
    }
  }
}).single('userPhoto');;

const config = require('../config/database');
const User = require('../models/user');

router.get('/checkEmail/:email', (req, res) => {
  if (!req.params.email) {
    res.json({ success: false, message: 'E-mail was not provided' });
  } else {
    User.findOne({ email: req.params.email }, (err, user) => {
      if (err) {
        res.json({ success: false, message: err });
      } else {
        if (user) {
          res.json({ success: false, message: 'E-mail is already taken' });
        } else {
          res.json({ success: true, message: 'E-mail is available' });
        }
      }
    });
  }
});

router.get('/checkUsername/:username', (req, res) => {
  if (!req.params.username) {
    res.json({ success: false, message: 'Username was not provided' });
  } else {
    User.findByUsername(req.params.username, (err, user) => {
      if (err) {
        res.json({ success: false, message: err });
      } else {
        if (user) {
          res.json({ success: false, message: 'Username is already taken' });
        } else {
          res.json({ success: true, message: 'Username is available' });
        }
      }
    });
  }
});

router.post('/register', (req, res) => {
  if(!req.body.email) {
    res.json({ success: false, message: 'You must provide an email' });
  } else if(!req.body.username) {
    res.json({ sccuess: false, message: 'You must provide a username' });
  } else if(!req.body.password) {
    res.json({ success: false, message: 'You must provide a password' });
  } else {
    let newUser = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      name: req.body.name,
      photo: 'uploads/no-user.png',
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    });
    User.addUser(newUser, (err, user) => {
      if(err){
        if(err.errors) {
          if(err.errors.email) {
            res.json({ success: false, message: err.errors.email.message });
          } else if(err.errors.username) {
            res.json({ success: false, message: err.errors.username.message})
          } else if(err.errors.password) {
            res.json({ success: false, message: err.errors.password.message});
          } else {
            res.json({ success: false, message: err });
          }
        } else {
          res.json({success: false, message: 'Failed to register user'});
        }
      }else{
        res.json({success: true, message: 'User registered'})
      }
    });
  }
});

router.post('/login', (req, res) => {
  if(!req.body.username) {
    res.json({ sccuess: false, message: 'You must provide a username' });
  } else if(!req.body.password) {
    res.json({ success: false, message: 'You must provide a password' });
  } else {
    const username = req.body.username;
    const password = req.body.password;
    User.findByUsername(username, (err, user) => {
      if(err) throw err;
      if(!user){
        return res.json({success: false, message: 'Username not found'});
      }
      User.comparePassword(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch){
          const token = jwt.sign({user_id: user._id}, config.secret, {
            expiresIn: 604800 // 1 week
          });
          res.json({
            success: true,
            message: 'Success!',
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
          return res.json({success: false, message: 'Wrong password'});
        }
      });
    });
  }
});

router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res) => {
  User.findById(req.user._id).select('first_name last_name username photo email').exec((err, user) => {
    if(err) {
      res.json({ success: false, message: err });
    } else {
      if(!user) {
        res.json({ success: false, message: 'User not found' });
      } else {
        res.json({ success: true, user: user });
      }
    }
  });
});

router.get('/get/:username', (req, res) => {
  if(!req.params.username) {
    res.json({ success: false, message: 'No username provided' });
  } else {
    User.findOne({username: req.params.username}).select('first_name last_name username photo email').exec((err, user) => {
      if(err) {
        res.json({ success: false, message: err });
      } else {
        if(!user) {
          res.json({ success: false, message: 'User not found' });
        } else {
          res.json({ success: true, user: user });
        }
      }
    });
  }
});

router.put('/update', passport.authenticate('jwt', {session: false}), (req, res, next) => {
  User.findById(req.user._id, (err, user) => {
    if(err) {
      res.json({ success: false, message: err});
    } else {
      if(!user) {
        res.json({ success: false, message: 'User not found' });
      } else {
        user.first_name = req.body.first_name;
        user.last_name = req.body.last_name;
        user.email = req.body.email;
        user.save((err) => {
          if(err) {
            if(err.errors){
              if(err.errors.first_name) {
                res.json({ success: false, message: err.errors.first_name.message });
              } else if(err.errors.last_name) {
                res.json({ success: false, message: err.errors.last_name.message });
              } else if(err.errors.email) {
                res.json({ success: false, message: err.errors.email.message });
              } else {
                res.json({ success: false, message: err });
              }
            } else {
              res.json({ success: false, message: err });
            }
          } else {
            res.json({ success: true, message: 'Profile Updated' });
          }
        });
      }
    }
  });
});

router.post('/changePassword', passport.authenticate('jwt', {session: false}), (req, res) => {
  User.findById(req.user._id, (err, user) => {
    if(err) {
      res.json({ success: false, message: 'Something went wrong' });
    } else {
      if(!user) {
        res.json({ success: false, message: 'User not found' });
      } else {
        User.comparePassword(req.body.old_password, user.password, (err, isMatch) => {
          if(err) throw err;
          if(isMatch){
            User.encryptPassword(req.body.new_password, (err, password) => {
              if(err) {
                res.json({ success: false, message: err });
              } else {
                user.password = password;
                user.save((err) => {
                  if(err) {
                    res.json({ success: false, message: 'Something went wrong' });
                  } else {
                    res.json({ success: true, message: 'Password Changed'});
                  }
                });
              }
            });
          } else {
            return res.json({success: false, message: 'Wrong password'});
          }
        });
      }
    }
  });
});

router.post('/uploadPhoto', passport.authenticate('jwt', {session: false}), (req, res) => {
  User.findById(req.user._id, (err, user) => {
    if(err) {
      res.json({ success: false, message: 'Something went wrong' });
    } else {
      if(!user) {
        res.json({ success: false, message: 'User not found' });
      } else {
        upload(req, res, (err) => {
          if(err) {
            res.json({ success: false, message: err });
          } else {
            if(req.file == undefined){
              res.json({ success: false, message: 'No file selected' });
            } else {
              user.photo = photo_path + req.file.filename;
              user.save((err) => {
                if(err) {
                  res.json({ success: false, message: 'Something went wrong' });
                } else {
                  res.json({ success: true, message: 'Photo uploaded' });
                }
              });
            }
          }
        });
      }
    }
  });
});

module.exports = router;