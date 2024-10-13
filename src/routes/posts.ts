import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { Types } from "mongoose";

import Post, { populatePost, populatePosts } from "../models/post";
import User from "../models/user";
import { getItemsPerPage, getPage } from "../util/pagination";

const router = Router();

type AuthUser = {
  _id: Types.ObjectId;
};

router.post(
  "/newPost",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const auth = req.user as AuthUser;
    if (!req.body.title) {
      res.status(400).json({ message: "Post title is required" });
    } else if (!req.body.body) {
      res.status(400).json({ message: "Post body is required" });
    } else if (!auth._id) {
      res.status(400).json({ message: "Post creator is required" });
    } else {
      let newPost = new Post({
        title: req.body.title,
        body: req.body.body,
        createdBy: auth._id,
      });
      try {
        await newPost.save();
        res.status(201).json({
          post: {
            _id: newPost.id,
            title: newPost.title,
            body: newPost.body,
            createdBy: newPost.createdBy,
            createdAt: newPost.createdAt,
          },
        });
      } catch (err: any) {
        if (err.errors) {
          if (err.errors.title) {
            res.status(400).json({ message: err.errors.title.message });
          } else if (err.errors.body) {
            res.status(400).json({ message: err.errors.body.message });
          } else {
            res.status(400).json({ message: err.message });
          }
        } else {
          res.status(500).json({ message: "Something went wrong" });
        }
      }
    }
  }
);

let get_user = function (req: Request, res: Response, next: NextFunction) {
  if (req.headers.authorization) {
    passport.authenticate(
      "jwt",
      { session: false },
      (err: any, user: Express.User, info: any) => {
        if (err) {
          return res.status(500).json({ message: "Something went wrong" });
        }
        if (user) {
          req.user = user;
        }
        next();
      }
    )(req, res, next);
  } else {
    next();
  }
};

interface CreatedBy {
  _id: Types.ObjectId;
  username: string;
  first_name: string;
  last_name: string;
}

interface PostItem {
  title: string;
  body: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  likes: number;
  dislikes: number;
  likedBy?: Types.ObjectId[];
  dislikedBy?: Types.ObjectId[];
  comments: Types.ObjectId[];
}

router.get("/page/:page/:itemsPerPage", get_user, async (req, res) => {
  if (!req.params.page) {
    res.status(400).json({ message: "No page provided" });
  } else {
    const auth = req.user as AuthUser | null;
    const page = getPage(req.params.page);
    const itemsPerPage = getItemsPerPage(req.params.itemsPerPage);
    const selector = auth
      ? "title body createdBy createdAt likes likedBy dislikes dislikedBy comments"
      : "title body createdBy createdAt likes dislikes comments";
    try {
      const posts = await Post.find({})
        .select<PostItem>(selector)
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .populate<{ createdBy: CreatedBy }>(
          "createdBy",
          "_id username first_name last_name"
        )
        .sort({ _id: -1 })
        .lean();
      if (!posts) {
        res.status(404).json({ message: "No posts found" });
      } else {
        res.status(200).json({
          posts: await populatePosts(posts, auth),
        });
      }
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
});

router.get(
  "/user/:username/page/:page/:itemsPerPage",
  get_user,
  async (req, res) => {
    if (!req.params.username) {
      res.status(400).json({ message: "No username provided" });
    } else if (!req.params.page) {
      res.status(400).json({ message: "No page provided" });
    } else {
      const auth = req.user as AuthUser | null;
      const page = getPage(req.params.page);
      const itemsPerPage = getItemsPerPage(req.params.itemsPerPage);
      const selector = auth
        ? "title body createdBy createdAt likes likedBy dislikes dislikedBy comments"
        : "title body createdBy createdAt likes dislikes comments";
      try {
        const user = await User.findByUsername(req.params.username);
        if (!user) {
          res.status(404).json({ message: "User not found" });
        } else {
          const posts = await Post.find({ createdBy: user._id })
            .select<PostItem>(selector)
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .populate<{ createdBy: CreatedBy }>(
              "createdBy",
              "_id username first_name last_name"
            )
            .sort({ _id: -1 })
            .lean();
          if (!posts) {
            res.status(404).json({ message: "No posts found" });
          } else {
            res.status(200).json({
              posts: await populatePosts(posts, user),
            });
          }
        }
      } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  }
);

router.get("/get/:id", get_user, async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ message: "No post id provided." });
  } else {
    const auth = req.user as AuthUser | null;
    const selector = auth
      ? "title body createdBy createdAt likes likedBy dislikes dislikedBy comments"
      : "title body createdBy createdAt likes dislikes comments";
    try {
      const post = await Post.findOne({ _id: req.params.id })
        .select(selector)
        .populate<{ createdBy: CreatedBy }>(
          "createdBy",
          "_id username first_name last_name"
        )
        .lean();
      if (!post) {
        res.status(404).json({ message: "Post not found" });
      } else {
        res.status(200).json({ post: await populatePost(post, auth) });
      }
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
});

interface EditablePost {
  title: string;
  body: string;
  createdBy: CreatedBy;
  createdAt: Date;
  likes: number;
  dislikes: number;
}

router.get(
  "/edit/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.params.id) {
      res.status(400).json({ message: "No post id provided" });
    } else {
      const auth = req.user as AuthUser;
      try {
        const post = await Post.findById(req.params.id)
          .select<EditablePost>("title body createdBy createdAt likes dislikes")
          .populate<{ createdBy: CreatedBy }>(
            "createdBy",
            "_id username first_name last_name"
          )
          .lean();
        if (!post) {
          res.status(404).json({ message: "Post not found" });
        } else {
          if (!auth._id.equals(post.createdBy._id)) {
            res.status(401).json({
              message: "You are not authorized to edit this post.",
            });
          } else {
            res.status(200).json({
              post: post,
            });
          }
        }
      } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  }
);

router.get("/popular", async (req, res) => {
  try {
    const posts = await Post.find()
      .limit(5)
      .populate<{ createdBy: CreatedBy }>(
        "createdBy",
        "_id username first_name last_name"
      )
      .sort({ likes: "desc" });
    if (!posts) {
      res.status(404).json({ message: "Posts not found" });
    } else {
      res.status(200).json({ posts: posts });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/count", async (req, res) => {
  try {
    const count = await Post.countDocuments({});
    res.status(200).json({ count: count });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/user/:username/count", async (req, res) => {
  if (!req.params.username) {
    res.status(400).json({ message: "No username provided" });
  } else {
    try {
      const user = await User.findByUsername(req.params.username);
      if (!user) {
        res.status(404).json({ message: "User not found" });
      } else {
        const count = await Post.countDocuments({ createdBy: user._id });
        res.status(200).json({ count: count });
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
    if (!req.body._id) {
      res.status(400).json({ message: "No post id provided" });
    } else {
      const auth = req.user as AuthUser;
      try {
        const post = await Post.findById(req.body._id);
        if (!post) {
          res.status(404).json({ success: false, message: "Post not found" });
        } else {
          if (!auth._id.equals(post.createdBy)) {
            res.status(401).json({
              message: "You are not authorized to edit this post.",
            });
          } else {
            post.title = req.body.title;
            post.body = req.body.body;
            try {
              await post.save();
              res.status(200).json({ success: true, message: "Post Updated!" });
            } catch (err: any) {
              if (err.errors) {
                if (err.errors.title) {
                  res.status(400).json({
                    message: err.errors.title.message,
                  });
                } else if (err.errors.body) {
                  res.status(400).json({
                    message: err.errors.body.message,
                  });
                } else {
                  res.status(400).json({ message: err });
                }
              } else {
                res.status(500).json({ message: "Something went wrong" });
              }
            }
          }
        }
      } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  }
);

router.delete(
  "/delete/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.params.id) {
      res.status(400).json({ message: "No post id provided" });
    } else {
      const auth = req.user as AuthUser;
      try {
        const post = await Post.findById(req.params.id);
        if (!post) {
          res.status(404).json({ messasge: "Post not found" });
        } else {
          if (!auth._id.equals(post.createdBy)) {
            res.status(401).json({
              message: "You are not authorized to delete this post",
            });
          } else {
            await Post.findByIdAndDelete(post._id);
            res.status(200).json({ message: "Post deleted!" });
          }
        }
      } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  }
);

interface UserInfo {
  _id: Types.ObjectId;
  username: string;
  first_name: string;
  last_name: string;
  photo: string;
}

router.get("/likes/:id/page/:page/:itemsPerPage", async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ message: "No post id provided" });
  } else if (!req.params.page) {
    res.status(400).json({ message: "No page provided" });
  } else {
    const page = getPage(req.params.page);
    const itemsPerPage = getItemsPerPage(req.params.itemsPerPage);
    try {
      const post = await Post.findById(req.params.id)
        .select<{ likes: number; likedBy: Types.ObjectId[] }>({
          likes: 1,
          likedBy: { $slice: [(page - 1) * itemsPerPage, itemsPerPage] },
        })
        .populate<{ likedBy: UserInfo[] }>({
          path: "likedBy",
          select: "_id first_name last_name username photo",
        });
      if (!post) {
        res.status(404).json({ messasge: "Post not found" });
      } else {
        res.status(200).json({ post });
      }
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
});

router.get("/dislikes/:id/page/:page/:itemsPerPage", async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ message: "No post id provided" });
  } else if (!req.params.page) {
    res.status(400).json({ message: "No page provided" });
  } else {
    const page = getPage(req.params.page);
    const itemsPerPage = getItemsPerPage(req.params.itemsPerPage);
    try {
      const post = await Post.findById(req.params.id)
        .select<{ dislikes: number; dislikedBy: Types.ObjectId[] }>({
          dislikes: 1,
          dislikedBy: { $slice: [(page - 1) * itemsPerPage, itemsPerPage] },
        })
        .populate<{ likedBy: UserInfo[] }>({
          path: "dislikedBy",
          select: "_id first_name last_name username photo",
        });
      if (!post) {
        res.status(404).json({ messasge: "Post not found" });
      } else {
        res.status(200).json({ post });
      }
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
});

router.put(
  "/like",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.body.id) {
      res.status(400).json({ message: "No post id provided" });
    } else {
      const auth = req.user as AuthUser;
      try {
        const post = await Post.findById(req.body.id);
        if (!post) {
          res.status(404).json({ message: "Post not found" });
        } else {
          if (auth._id.equals(post.createdBy)) {
            res.status(400).json({
              message: "Cannot like your own post",
            });
          } else {
            let likeIndex = post.likedBy.indexOf(auth._id);
            if (likeIndex > -1) {
              post.likes--;
              post.likedBy.splice(likeIndex, 1);
              await post.save();
              res.status(200).json({
                message: "Post unliked!",
              });
            } else {
              let dislikeIndex = post.dislikedBy.indexOf(auth._id);
              if (dislikeIndex > -1) {
                post.dislikes--;
                post.dislikedBy.splice(dislikeIndex, 1);
              }
              post.likes++;
              post.likedBy.push(auth._id);
              await post.save();
              res.status(200).json({ message: "Post liked!" });
            }
          }
        }
      } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  }
);

router.put(
  "/dislike",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.body.id) {
      res.status(400).json({ message: "No post id provided" });
    } else {
      const auth = req.user as AuthUser;
      try {
        const post = await Post.findById(req.body.id);
        if (!post) {
          res.status(404).json({ message: "Post not found" });
        } else {
          if (auth._id.equals(post.createdBy)) {
            res.status(400).json({
              message: "Cannot dislike your own post",
            });
          } else {
            let dislikeIndex = post.dislikedBy.indexOf(auth._id);
            if (dislikeIndex > -1) {
              post.dislikes--;
              post.dislikedBy.splice(dislikeIndex, 1);
              await post.save();
              res.status(200).json({
                message: "Post undisliked!",
              });
            } else {
              let likeIndex = post.likedBy.indexOf(auth._id);
              if (likeIndex > -1) {
                post.likes--;
                post.likedBy.splice(likeIndex, 1);
              }
              post.dislikes++;
              post.dislikedBy.push(auth._id);
              await post.save();
              res.status(200).json({
                message: "Post disliked!",
              });
            }
          }
        }
      } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  }
);

export default router;
