const express = require('express');
const router = express.Router();
const passport = require('passport');

const config = require('../config/database');
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');

router.post('/newComment', passport.authenticate('jwt', {session: false}), (req, res) => {
  if(!req.body.parent_post){
    res.status(200).json({ success:false, message: 'No post id provided' });
  } else if(!req.body.comment) {
    res.status(200).json({ success: false, message: 'No comment provided' });
  } else {
    Post.findById(req.body.parent_post, (err, post) => {
      if(err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
      } else {
        if(!post) {
          res.status(404).json({ success: false, message: 'Post not found' });
        } else {
          let newComment = new Comment({
            comment: req.body.comment,
            createdBy: req.user._id,
            parentPost: req.body.parent_post
          });
          newComment.save((err) => {
            if(err) {
              res.status(500).json({ success: false, message: 'Something went wrong' });
            } else {
              post.comments.push(newComment._id);
              post.save((err) => {
                if(err) {
                  res.status(500).json({ success: false, message: 'Something went wrong' });
                } else {
                  res.status(201).json({ success: true, message: 'Comment Added', comment: newComment });
                }
              });
            }
          });
        }
      }
    });
  }
});

router.post('/newReply', passport.authenticate('jwt', {session: false}), (req, res) => {
  if(!req.body.parent_comment){
    res.status(200).json({ success:false, message: 'No comment id provided' });
  } else if(!req.body.comment) {
    res.status(200).json({ success: false, message: 'No comment provided' });
  } else {
    Comment.findById(req.body.parent_comment, (err, comment) => {
      if(err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
      } else {
        if(!comment) {
          res.status(404).json({ success: false, message: 'Comment not found' });
        } else {
          let newComment = new Comment({
            comment: req.body.comment,
            createdBy: req.user._id,
            parentComment: req.body.parent_comment
          });
          newComment.save((err) => {
            if(err) {
              res.status(500).json({ success: false, message: 'Something went wrong' });
            } else {
              comment.replies.push(newComment._id);
              comment.save((err) => {
                if(err) {
                  res.status(500).json({ success: false, message: 'Something went wrong' });
                } else {
                  res.status(201).json({ success: true, message: 'Comment Added', comment: newComment });
                }
              });
            }
          });
        }
      }
    });
  }
});

router.post('/getComments/:id', (req, res) => {
  if(!req.params.id){
    res.status(200).json({ success: false, message: 'No post id provided' });
  } else {
    let before = req.body.before? req.body.before : Date.now();
    let limit = req.body.limit? req.body.limit: 5;
    Post.findById(req.params.id).select('comments').populate({
      path: 'comments',
      select: '_id comment createdBy createdAt replies',
      populate: {
        path: 'createdBy',
        select: '_id first_name last_name photo'
      },
      match: {
        createdAt: {'$lt': before}
      },
      options: {
        sort: {createdAt: "desc"},
        limit: limit
      }
    }).lean().exec((err, post) => {
      if(err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
      } else {
        if(!post) {
          res.status(404).json({ success: false, message: 'Post not found' });
        } else {
          let comments = post.comments.map(comment => {
            comment.replies = comment.replies.length;
            return comment;
          });
          res.status(200).json({ success: true, comments: comments });
        }
      }
    });
  }
});

router.post('/getReplies/:id', (req, res) => {
  if(!req.params.id){
    res.status(200).json({ success: false, message: 'No comment id provided' });
  } else {
    let before = req.body.before? req.body.before : Date.now();
    let limit = req.body.limit? req.body.limit: 5;
    Comment.findById(req.params.id).select('replies').populate({
      path: 'replies',
      populate: {
        path: 'createdBy',
        select: '_id first_name last_name photo'
      },
      match: {
        createdAt: {'$lt': before}
      },
      options: {
        sort: {createdAt: "desc"},
        limit: limit
      }
    }).lean().exec((err, comment) => {
      if(err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
      } else {
        if(!comment) {
          res.status(404).json({ success: false, message: 'Comment not found' });
        } else {
          let replies = comment.replies.map(reply => {
            reply.replies = reply.replies.length;
            return reply;
          });
          res.status(200).json({ success: true, comments: replies });
        }
      }
    });
  }
});

router.get('/count/:id', (req, res) => {
  if(!req.params.id) {
    res.status(200).json({ success: false, message: 'No post id provided' });
  } else {
    Post.getCommentCount(req.params.id, (err, count) => {
      if(err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
      } else {
        if(count===false) {
          res.status(404).json({ success: false, message: 'Post not found' });
        } else {
          res.status(200).json({ success: true, count: count });
        }
      }
    });
  }
});

router.delete('/delete/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  if(!req.params.id) {
    res.status(200).json({ success: false, message: 'No comment id provided' });
  } else {
    Comment.findById(req.params.id, (err, comment) => {
      if(err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
      } else {
        if(!comment) {
          res.status(404).json({ success: false, message: 'Comment not found' })
        } else {
          if(comment.parentPost) {
            Post.findByIdAndUpdate(comment.parentPost, {$pull: {comments: req.params.id}}, (err, post) => {
              if(err) {
                res.status(500).json({ success: false, message: 'Something went wrong' });
              } else {
                comment.remove((err) => {
                  if(err) {
                    res.status(500).json({ success: false, message: 'Something went wrong' });
                  } else {
                    res.status(200).json({ success: true, message: 'Comment deleted' });
                  }
                });
              }
            });
          } else if(comment.parentComment) {
            Comment.findByIdAndUpdate(comment.parentComment, {$pull: {replies: req.params.id}}, (err, post) => {
              if(err) {
                res.status(500).json({ success: false, message: 'Something went wrong' });
              } else {
                comment.remove((err) => {
                  if(err) {
                    res.status(500).json({ success: false, message: 'Something went wrong' });
                  } else {
                    res.status(200).json({ success: true, message: 'Comment deleted' });
                  }
                });
              }
            });
          } else {
            comment.remove((err) => {
              if(err) {
                res.status(500).json({ success: false, message: 'Something went wrong' });
              } else {
                res.status(200).json({ success: true, message: 'Comment deleted' });
              }
            });
          }
        }
      }
    });
  }
});

module.exports = router;