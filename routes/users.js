const express = require("express");
const router = express.Router();
const passport = require("passport");
const path = require("path");
const multer = require("multer");

const public_path = "./public/";
const photo_path = "uploads/";
const storage = multer.diskStorage({
  destination: public_path + photo_path,
  filename: function (req, file, callback) {
    callback(null, req.user._id + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 },
  fileFilter: function (req, file, callback) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      callback(null, true);
    } else {
      callback("Images Only");
    }
  },
}).single("userPhoto");

const User = require("../models/user");
const Post = require("../models/post");

router.get("/checkEmail/:email", (req, res) => {
  if (!req.params.email) {
    res
      .status(400)
      .json({ success: false, message: "E-mail was not provided" });
  } else {
    User.findOne({ email: req.params.email })
      .then((user) => {
        if (user) {
          res
            .status(200)
            .json({ success: false, message: "E-mail is already taken" });
        } else {
          res
            .status(200)
            .json({ success: true, message: "E-mail is available" });
        }
      })
      .catch((err) => {
        res.status(500).json({ success: false, message: err });
      });
  }
});

router.get("/checkUsername/:username", (req, res) => {
  if (!req.params.username) {
    res
      .status(400)
      .json({ success: false, message: "Username was not provided" });
  } else {
    User.findByUsername(req.params.username)
      .then((user) => {
        if (user) {
          res
            .status(200)
            .json({ success: false, message: "Username is already taken" });
        } else {
          res
            .status(200)
            .json({ success: true, message: "Username is available" });
        }
      })
      .catch((err) => {
        res.status(500).json({ success: false, message: err });
      });
  }
});

router.post("/register", (req, res) => {
  let newUser = new User({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
  });
  User.register(newUser, (err, user) => {
    if (err) {
      if (err.email) {
        res.status(400).json({ success: false, message: err.email.message });
      } else if (err.username) {
        res.status(400).json({ success: false, message: err.username.message });
      } else if (err.password) {
        res.status(400).json({ success: false, message: err.password.message });
      } else {
        res
          .status(err.status)
          .json({ success: false, message: "Failed to register user" });
      }
    } else {
      User.login(req.body.username, req.body.password, (err, login) => {
        if (err) {
          res.status(err.status).json({ success: false, message: err.message });
        } else {
          res.status(201).json({
            success: true,
            message: "Sucess!",
            token: login.token,
            user: login.user,
          });
        }
      });
    }
  });
});

router.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  User.login(username, password, (err, login) => {
    if (err) {
      res.status(err.status).json({ success: false, message: err.message });
    } else {
      res.status(200).json({
        success: true,
        message: "Sucess!",
        token: login.token,
        user: login.user,
      });
    }
  });
});

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user._id)
      .select("first_name last_name username photo email dark_mode round_icons")
      .then((user) => {
        if (!user) {
          res.status(404).json({ success: false, message: "User not found" });
        } else {
          res.status(200).json({ success: true, user: user });
        }
      })
      .catch((err) => {
        res.status(500).json({ success: false, message: err });
      });
  }
);

router.get("/get/:username", (req, res) => {
  if (!req.params.username) {
    res.status(400).json({ success: false, message: "No username provided" });
  } else {
    User.findOne({ username: req.params.username })
      .select("first_name last_name username photo email")
      .then((user) => {
        if (!user) {
          res.status(404).json({ success: false, message: "User not found" });
        } else {
          res.status(200).json({ success: true, user: user });
        }
      })
      .catch((err) => {
        res.status(500).json({ success: false, message: err });
      });
  }
});

router.put(
  "/update",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user._id)
      .then((user) => {
        if (!user) {
          res.status(404).json({ success: false, message: "User not found" });
        } else {
          user.first_name = req.body.first_name;
          user.last_name = req.body.last_name;
          user.email = req.body.email;
          user
            .save()
            .then(() => {
              res.status(200).json({
                success: true,
                message: "Profile Updated",
                user: {
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email: user.email,
                },
              });
            })
            .catch((err) => {
              if (err.errors) {
                if (err.errors.first_name) {
                  res.status(400).json({
                    success: false,
                    message: err.errors.first_name.message,
                  });
                } else if (err.errors.last_name) {
                  res.status(400).json({
                    success: false,
                    message: err.errors.last_name.message,
                  });
                } else if (err.errors.email) {
                  res.status(400).json({
                    success: false,
                    message: err.errors.email.message,
                  });
                } else {
                  res.status(500).json({ success: false, message: err });
                }
              } else {
                res.status(500).json({ success: false, message: err });
              }
            });
        }
      })
      .catch((err) => {
        res.status(500).json({ success: false, message: err });
      });
  }
);

router.post(
  "/changePassword",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user._id)
      .then((user) => {
        if (!user) {
          res.status(404).json({ success: false, message: "User not found" });
        } else {
          User.comparePassword(
            req.body.old_password,
            user.password,
            (err, isMatch) => {
              if (err) {
                res
                  .status(err.status)
                  .json({ success: false, message: err.message });
              } else {
                if (isMatch) {
                  User.encryptPassword(
                    req.body.new_password,
                    (err, password) => {
                      if (err) {
                        res
                          .status(err.status)
                          .json({ success: false, message: err.message });
                      } else {
                        user.password = password;
                        user
                          .save()
                          .then(() => {
                            res.status(200).json({
                              success: true,
                              message: "Password Changed",
                            });
                          })
                          .catch((err) => {
                            res.status(500).json({
                              success: false,
                              message: "Something went wrong",
                            });
                          });
                      }
                    }
                  );
                } else {
                  return res
                    .status(200)
                    .json({ success: false, message: "Wrong password" });
                }
              }
            }
          );
        }
      })
      .catch((err) => {
        res
          .status(500)
          .json({ success: false, message: "Something went wrong" });
      });
  }
);

router.post(
  "/uploadPhoto",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user._id)
      .then((user) => {
        if (!user) {
          res.status(404).json({ success: false, message: "User not found" });
        } else {
          upload(req, res, (err) => {
            if (err) {
              res.status(500).json({ success: false, message: err });
            } else {
              if (req.file == undefined) {
                res
                  .status(400)
                  .json({ success: false, message: "No file selected" });
              } else {
                user.photo = photo_path + req.file.filename;
                user
                  .save()
                  .then(() => {
                    res
                      .status(200)
                      .json({ success: true, message: "Photo uploaded" });
                  })
                  .catch((err) => {
                    res.status(500).json({
                      success: false,
                      message: "Something went wrong",
                    });
                  });
              }
            }
          });
        }
      })
      .catch((err) => {
        res
          .status(500)
          .json({ success: false, message: "Something went wrong" });
      });
  }
);

router.put(
  "/bookmark/add",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    User.findById(req.user._id)
      .then((user) => {
        if (!user) {
          res.status(404).json({ success: false, message: "User not found" });
        } else {
          if (user.bookmarks.indexOf(req.body.id) == -1) {
            Post.findById(req.body.id)
              .then((post) => {
                if (!post) {
                  res
                    .status(404)
                    .json({ success: false, message: "Post not found" });
                } else {
                  user.bookmarks.push(post._id);
                  user
                    .save()
                    .then(() => {
                      res
                        .status(200)
                        .json({ success: true, message: "Bookmarked" });
                    })
                    .catch((err) => {
                      res.status(500).json({
                        success: false,
                        message: "Something went wrong",
                      });
                    });
                }
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Something went wrong" });
              });
          } else {
            res
              .status(400)
              .json({ success: true, message: "Post already bookmarked" });
          }
        }
      })
      .catch((err) => {
        res.status(500).json({ success: false, message: err });
      });
  }
);

router.put(
  "/bookmark/remove",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    User.findByIdAndUpdate(req.user._id, { $pull: { bookmarks: req.body.id } })
      .then((user) => {
        if (!user) {
          res.status(404).json({ success: false, message: "User not found" });
        } else {
          res.status(200).json({ success: true, message: "Bookmark Removed" });
        }
      })
      .catch((err) => {
        res.status(500).json({ success: false, message: err });
      });
  }
);

router.get(
  "/bookmark/count",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.status(200).json({ success: true, count: req.user.bookmarks.length });
  }
);

router.get(
  "/bookmark/page/:page/:itemsPerPage",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    let itemsPerPage = 5;
    if (!req.params.page) {
      res.status(400).json({ success: false, message: "No page provided" });
    } else {
      let page = req.params.page;
      if (req.params.itemsPerPage && req.params.itemsPerPage < 15)
        itemsPerPage = parseInt(req.params.itemsPerPage);
      User.findById(req.user._id)
        .select({
          bookmarks: { $slice: [(page - 1) * itemsPerPage, itemsPerPage] },
        })
        .populate({
          path: "bookmarks",
          populate: {
            path: "createdBy",
            select: "_id username first_name last_name",
          },
        })
        .lean()
        .then((user) => {
          if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
          } else {
            res.status(200).json({
              success: true,
              posts: Post.populatePosts(user.bookmarks, req.user),
            });
          }
        })
        .catch((err) => {
          res
            .status(500)
            .status.json({ success: false, message: "Something went wrong" });
        });
    }
  }
);

router.post(
  "/darkMode",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user._id)
      .then((user) => {
        if (!user) {
          res.status(404).json({ success: false, message: "User not found" });
        } else {
          user.dark_mode = req.body.status;
          user
            .save()
            .then(() => {
              res
                .status(200)
                .json({ success: true, message: "Dark Mode Activated" });
            })
            .catch((err) => {
              res
                .status(500)
                .json({ success: false, message: "Something went wrong" });
            });
        }
      })
      .catch((err) => {
        res
          .status(500)
          .json({ success: false, message: "Something went wrong" });
      });
  }
);

router.post(
  "/roundIcons",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user._id)
      .then((user) => {
        if (!user) {
          res.status(404).json({ success: false, message: "User not found" });
        } else {
          user.round_icons = req.body.status;
          user
            .save()
            .then(() => {
              res
                .status(200)
                .json({ success: true, message: "Round Icons Activated" });
            })
            .catch((err) => {
              res
                .status(500)
                .json({ success: false, message: "Something went wrong" });
            });
        }
      })
      .catch((err) => {
        res
          .status(500)
          .json({ success: false, message: "Something went wrong" });
      });
  }
);

module.exports = router;
