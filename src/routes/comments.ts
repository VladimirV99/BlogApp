import { Router } from "express";
import passport from "passport";
import { Types } from "mongoose";

import Post from "../models/post";
import Comment from "../models/comment";

const router = Router();

type AuthUser = {
  _id: Types.ObjectId;
  first_name: string;
  last_name: string;
  photo: string;
};

router.post(
  "/newComment",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.body.parent_post) {
      res.status(400).json({ message: "No post id provided" });
    } else if (!req.body.comment) {
      res.status(400).json({ message: "No comment provided" });
    } else {
      const auth = req.user as AuthUser;
      try {
        const post = await Post.findById(req.body.parent_post);
        if (!post) {
          res.status(404).json({ message: "Post not found" });
        } else {
          let newComment = new Comment({
            comment: req.body.comment,
            createdBy: auth._id,
            parentPost: req.body.parent_post,
          });
          await newComment.save();
          post.comments.push(newComment._id);
          try {
            await post.save();
            res.status(201).json({
              comment: {
                _id: newComment._id,
                comment: newComment.comment,
                createdAt: newComment.createdAt,
                createdBy: {
                  _id: auth._id,
                  first_name: auth.first_name,
                  last_name: auth.last_name,
                  photo: auth.photo,
                },
                replies: 0,
              },
            });
          } catch (err) {
            await newComment.deleteOne();
            res.status(500).json({ message: "Something went wrong" });
          }
        }
      } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  }
);

router.post(
  "/newReply",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.body.parent_comment) {
      res.status(400).json({ message: "No comment id provided" });
    } else if (!req.body.comment) {
      res.status(200).json({ message: "No comment provided" });
    } else {
      const auth = req.user as AuthUser;
      try {
        const comment = await Comment.findById(req.body.parent_comment);
        if (!comment) {
          res.status(404).json({ message: "Comment not found" });
        } else {
          let newComment = new Comment({
            comment: req.body.comment,
            createdBy: auth._id,
            parentComment: req.body.parent_comment,
          });
          await newComment.save();
          comment.replies.push(newComment._id);
          try {
            await comment.save();
            res.status(201).json({
              comment: {
                _id: newComment._id,
                comment: newComment.comment,
                createdAt: newComment.createdAt,
                createdBy: {
                  _id: auth._id,
                  first_name: auth.first_name,
                  last_name: auth.last_name,
                  photo: auth.photo,
                },
                replies: 0,
              },
            });
          } catch (err) {
            await newComment.deleteOne();
            res.status(500).json({ message: "Something went wrong" });
          }
        }
      } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  }
);

interface PopulatedComment {
  _id: Types.ObjectId;
  comment: string;
  createdBy: {
    _id: Types.ObjectId;
    first_name: string;
    last_name: string;
    photo: string;
  };
  createdAt: Date;
  replies: Types.ObjectId[];
}

router.post("/getComments/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ success: false, message: "No post id provided" });
  } else {
    let before = req.body.before ? new Date(req.body.before) : Date.now();
    let limit = req.body.limit ? req.body.limit : 5;
    try {
      const post = await Post.findById(req.params.id)
        .select<{ comments: Types.ObjectId[] }>("comments")
        .populate<{
          comments: PopulatedComment[];
        }>({
          path: "comments",
          select: "_id comment createdBy createdAt replies",
          populate: {
            path: "createdBy",
            select: "_id first_name last_name photo",
          },
          match: {
            createdAt: { $lt: before },
          },
          options: {
            sort: { createdAt: "desc" },
            limit: limit,
          },
        })
        .lean();
      if (!post) {
        res.status(404).json({ message: "Post not found" });
      } else {
        const comments = post.comments.map((comment) => {
          return {
            ...comment,
            replies: comment.replies.length,
          };
        });
        res.status(200).json({ comments: comments });
      }
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
});

router.post("/getReplies/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ message: "No comment id provided" });
  } else {
    let before = req.body.before ? req.body.before : Date.now();
    let limit = req.body.limit ? req.body.limit : 5;
    try {
      const comment = await Comment.findById(req.params.id)
        .select<{ replies: Types.ObjectId[] }>("replies")
        .populate<{
          replies: PopulatedComment[];
        }>({
          path: "replies",
          populate: {
            path: "createdBy",
            select: "_id first_name last_name photo",
          },
          match: {
            createdAt: { $lt: before },
          },
          options: {
            sort: { createdAt: "desc" },
            limit: limit,
          },
        })
        .lean();
      if (!comment) {
        res.status(404).json({ message: "Comment not found" });
      } else {
        const replies = comment.replies.map((reply) => {
          return {
            ...reply,
            replies: reply.replies.length,
          };
        });
        res.status(200).json({ comments: replies });
      }
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
});

router.get("/count/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ message: "No post id provided" });
  } else {
    try {
      const post = await Post.findById(req.params.id)
        .select<{ comments: Types.ObjectId[] }>("comments")
        .lean();
      if (!post) {
        res.status(404).json({ message: "Post not found" });
      } else {
        res.status(200).json({ count: post.comments.length });
      }
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
});

router.delete(
  "/delete/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.params.id) {
      res.status(400).json({ message: "No comment id provided" });
    } else {
      try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) {
          res.status(404).json({ message: "Comment not found" });
        } else {
          if (comment.parentPost) {
            const post = await Post.findByIdAndUpdate(comment.parentPost, {
              $pull: { comments: req.params.id },
            });
            res.status(200).json({ message: "Comment deleted" });
          } else if (comment.parentComment) {
            const post = await Comment.findByIdAndUpdate(
              comment.parentComment,
              {
                $pull: { replies: req.params.id },
              }
            );
            res.status(200).json({ message: "Comment deleted" });
          } else {
            res.status(200).json({ message: "Comment deleted" });
          }
        }
      } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  }
);

export default router;
