import { Router } from "express";
import passport from "passport";
import { Types } from "mongoose";
import multer from "multer";
import path from "path";

const public_path = "public/";
const photo_path = "uploads/";
const storage = multer.diskStorage({
  destination: public_path + photo_path,
  filename: function (req, file, callback) {
    const auth = req.user as AuthUser;
    callback(null, auth._id + path.extname(file.originalname));
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
      callback(new Error("Images Only"));
    }
  },
}).single("userPhoto");

import User from "../models/user";
import Post, { populatePosts } from "../models/post";
import { getItemsPerPage, getPage } from "../util/pagination";

const router = Router();

type AuthUser = {
  _id: Types.ObjectId;
  bookmarks: Types.ObjectId[];
};

router.get("/checkEmail/:email", async (req, res) => {
  if (!req.params.email) {
    res.status(400).json({ message: "E-mail was not provided" });
  } else {
    try {
      const user = await User.findOne({ email: req.params.email });
      res.status(200).json({ available: user === null });
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
});

router.get("/checkUsername/:username", async (req, res) => {
  if (!req.params.username) {
    res.status(400).json({ message: "Username was not provided" });
  } else {
    try {
      const user = await User.findByUsername(req.params.username);
      res.status(200).json({ available: user === null });
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
});

router.post("/register", async (req, res) => {
  if (!req.body.email) {
    res.status(400).json({ message: "You must provide an email" });
  } else if (!req.body.username) {
    res.status(400).json({ message: "You must provide a username" });
  } else if (!req.body.password) {
    res.status(400).json({ message: "You must provide a password" });
  } else {
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    });
    try {
      await user.save();
      res.status(201).json({
        token: user.getToken(),
        user: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          email: user.email,
          photo: user.photo,
          dark_mode: user.dark_mode,
          round_icons: user.round_icons,
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
});

router.post("/login", async (req, res) => {
  if (!req.body.username) {
    res.status(400).json({ message: "You must provide a username" });
  } else if (!req.body.password) {
    res.status(400).json({ message: "You must provide a password" });
  } else {
    try {
      const user = await User.findByUsername(req.body.username);
      if (!user) {
        res.status(401).json({ message: "Invalid username or password" });
      } else {
        const isMatch = await user.comparePassword(req.body.password);
        if (isMatch) {
          res.status(200).json({
            token: user.getToken(),
            user: {
              _id: user._id,
              first_name: user.first_name,
              last_name: user.last_name,
              username: user.username,
              email: user.email,
              photo: user.photo,
              dark_mode: user.dark_mode,
              round_icons: user.round_icons,
            },
          });
        } else {
          res.status(401).json({ message: "Invalid username or password" });
        }
      }
    } catch (err) {}
  }
});

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const auth = req.user as AuthUser;
    try {
      const user = await User.findById(auth._id).select(
        "first_name last_name username photo email dark_mode round_icons"
      );
      if (!user) {
        res.status(404).json({ message: "User not found" });
      } else {
        res.status(200).json({ user: user });
      }
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

router.get("/get/:username", async (req, res) => {
  if (!req.params.username) {
    res.status(400).json({ message: "No username provided" });
  } else {
    try {
      const user = await User.findOne({ username: req.params.username }).select(
        "first_name last_name username photo email"
      );
      if (!user) {
        res.status(404).json({ message: "User not found" });
      } else {
        res.status(200).json({ user: user });
      }
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
});

router.put(
  "/update",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const auth = req.user as AuthUser;
    try {
      const user = await User.findById(auth._id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
      } else {
        user.first_name = req.body.first_name;
        user.last_name = req.body.last_name;
        user.email = req.body.email;
        await user.save();
        res.status(200).json({
          user: {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
          },
        });
      }
    } catch (err: any) {
      if (err.errors) {
        if (err.errors.first_name) {
          res.status(400).json({
            message: err.errors.first_name.message,
          });
        } else if (err.errors.last_name) {
          res.status(400).json({
            message: err.errors.last_name.message,
          });
        } else if (err.errors.email) {
          res.status(400).json({
            message: err.errors.email.message,
          });
        } else {
          res.status(500).json({ message: err.message });
        }
      } else {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  }
);

router.post(
  "/changePassword",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.body.old_password) {
      res.status(400).json({ message: "No password provided" });
    } else if (!req.body.new_password) {
      res.status(400).json({ message: "No password provided" });
    } else {
      const auth = req.user as AuthUser;
      try {
        const user = await User.findById(auth._id);
        if (!user) {
          res.status(404).json({ message: "User not found" });
        } else {
          const isMatch = await user.comparePassword(req.body.old_password);
          if (isMatch) {
            user.password = req.body.new_password;
            try {
              await user.save();
              res.status(200).json();
            } catch (err: any) {
              if (err.status) {
                res.status(err.status).json({ message: err.message });
              } else {
                res.status(500).json({ message: "Something went wrong" });
              }
            }
          } else {
            res.status(401).json({
              message: "Wrong password",
            });
          }
        }
      } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  }
);

router.post(
  "/uploadPhoto",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const auth = req.user as AuthUser;
    try {
      const user = await User.findById(auth._id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
      } else {
        upload(req, res, async (err) => {
          if (err) {
            res.status(500).json({ message: "Something went wrong" });
          } else {
            if (req.file == undefined) {
              res.status(400).json({ message: "No file selected" });
            } else {
              user.photo = photo_path + req.file.filename;
              await user.save();
              res.status(200).json({ photo: user.photo });
            }
          }
        });
      }
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

router.put(
  "/bookmark/add",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.body.id) {
      res.status(400).json({ message: "Post id not provided" });
    } else {
      const auth = req.user as AuthUser;
      try {
        const user = await User.findById(auth._id);
        if (!user) {
          res.status(404).json({ message: "User not found" });
        } else {
          if (user.bookmarks.indexOf(req.body.id) == -1) {
            const post = await Post.findById(req.body.id);
            if (!post) {
              res.status(404).json({ message: "Post not found" });
            } else {
              user.bookmarks.push(post._id);
              await user.save();
              res.status(200).json({ message: "Bookmarked" });
            }
          } else {
            res.status(200).json({ message: "Post already bookmarked" });
          }
        }
      } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  }
);

router.put(
  "/bookmark/remove",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.body.id) {
      res.status(400).json({ message: "Post id not provided" });
    } else {
      const auth = req.user as AuthUser;
      try {
        const user = await User.findByIdAndUpdate(auth._id, {
          $pull: { bookmarks: req.body.id },
        });
        if (!user) {
          res.status(404).json({ message: "User not found" });
        } else {
          res.status(200).json({ message: "Bookmark Removed" });
        }
      } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  }
);

router.get(
  "/bookmark/count",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const auth = req.user as AuthUser;
    res.status(200).json({ count: auth.bookmarks.length });
  }
);

interface CreatedBy {
  _id: Types.ObjectId;
  username: string;
  first_name: string;
  last_name: string;
}

interface PostItem {
  _id: Types.ObjectId;
  title: string;
  body: string;
  createdBy: CreatedBy;
  createdAt: Date;
  likes: number;
  dislikes: number;
  likedBy: Types.ObjectId[];
  dislikedBy: Types.ObjectId[];
  comments: Types.ObjectId[];
}

router.get(
  "/bookmark/page/:page/:itemsPerPage",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.params.page) {
      res.status(400).json({ message: "No page provided" });
    } else {
      const auth = req.user as AuthUser;
      const page = getPage(req.params.page);
      const itemsPerPage = getItemsPerPage(req.params.itemsPerPage);
      try {
        const user = await User.findById(auth._id)
          .select<{ bookmarks: Types.ObjectId[] }>({
            bookmarks: { $slice: [(page - 1) * itemsPerPage, itemsPerPage] },
          })
          .populate<{
            bookmarks: PostItem[];
          }>({
            path: "bookmarks",
            populate: {
              path: "createdBy",
              select: "_id username first_name last_name",
            },
          })
          .lean();
        if (!user) {
          res.status(404).json({ message: "User not found" });
        } else {
          res.status(200).json({
            posts: populatePosts(user.bookmarks, auth),
          });
        }
      } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  }
);

router.post(
  "/darkMode",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.body.status) {
      res.status(400).json({ message: "Status not provided" });
    } else {
      const auth = req.user as AuthUser;
      try {
        const user = await User.findById(auth._id);
        if (!user) {
          res.status(404).json({ message: "User not found" });
        } else {
          user.dark_mode = req.body.status;
          await user.save();
          res.status(200).json({ status: user.dark_mode });
        }
      } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  }
);

router.post(
  "/roundIcons",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.body.status) {
      res.status(400).json({ message: "Status not provided" });
    } else {
      const auth = req.user as AuthUser;
      try {
        const user = await User.findById(auth._id);
        if (!user) {
          res.status(404).json({ message: "User not found" });
        } else {
          user.round_icons = req.body.status;
          await user.save();
          res.status(200).json({ status: user.dark_mode });
        }
      } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  }
);

export default router;
