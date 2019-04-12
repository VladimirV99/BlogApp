const express = require('express');
const router = express.Router();
const passport = require('passport');

const config = require('../config/database');
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');

// Normal include method doesn't work on ObjectIds
function includesId(array, id) {
  for(let i = 0; i < array.length; i++) {
    if(array[i].equals(id)){
      return true;
    }
  }
  return false;
}

router.post('/newPost', passport.authenticate('jwt', {session: false}), (req, res) => {
  if(!req.body.title) {
    res.status(400).json({ success: false, message: 'Post title is required' });
  } else if(!req.body.body) {
    res.status(400).json({ success: false, message: 'Post body is required' });
  } else if(!req.user._id) {
    res.status(400).json({ success: false, message: 'Post creator is required' });
  } else {
    let newPost = new Post({
      title: req.body.title,
      body: req.body.body,
      createdBy: req.user._id
    });
    newPost.save((err, post) => {
      if(err){
        if(err.errors) {
          if(err.errors.title) {
            res.status(400).json({ success: false, message: err.errors.title.message });
          } else if(err.errors.body) {
            res.status(400).json({ success: false, message: err.errors.body.message });
          } else {
            res.status(400).json({ success: false, message: err });
          }
        } else {
          res.status(500).json({ success: false, message: err });
        }
      } else {
        res.status(201).json({ success: true, message: 'Post saved!' });
      }
    });
  }
});

let get_user = function(req, res, next) {
  if(req.headers.authorization) {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
      if(err) {
        return res.status(500).json({success: false, message: err});
      }
      if(user){
        req.user = user;
        req.user.authenticated = true;
      } else {
        req.user = {authenticated: false};
      }
      next();
    })(req, res, next);
  } else {
    req.user = {authenticated: false};
    next();
  }
}

router.get('/page/:page/:itemsPerPage', get_user, (req, res) => {
  let itemsPerPage = 5;
  if(!req.params.page) {
    res.status(400).json({ success: false, message: 'No page provided' });
  } else {
    let selector = req.user.authenticated? 'title body createdBy createdAt likes likedBy dislikes dislikedBy comments' : 'title body createdBy createdAt likes dislikes comments';
    let page = req.params.page;
    if(req.params.itemsPerPage && req.params.itemsPerPage<15)
      itemsPerPage = parseInt(req.params.itemsPerPage);
    Post.find({}).populate('createdBy', '_id username first_name last_name').select(selector).sort({ '_id': -1 }).skip((page-1)*itemsPerPage).limit(itemsPerPage).lean().exec((err, posts) => {
      if(err) {
        res.status(500).json({ success: false, message: err });
      } else {
        if(!posts) {
          res.status(404).json({ success: false, message: 'No posts found' });
        } else {
          if(req.user.authenticated){
            posts.forEach(post => {
              post.totalComments = post.comments.length;
              post.bookmarked = includesId(req.user.bookmarks, post._id);
              post.likedByUser = false;
              post.dislikedByUser = false;
              if(includesId(post.likedBy, req.user._id)) {
                post.likedByUser = true;
              }else if(includesId(post.dislikedBy, req.user._id)) {
                post.dislikedByUser = true;
              }
              delete post.likedBy;
              delete post.dislikedBy;
            });
          } else {
            posts.forEach(post => {
              post.totalComments = post.comments.length;
            });
          }
          res.status(200).json({ success: true, posts: posts });
        }
      }
    });
  }
});

router.get('/user/:username/page/:page', get_user, (req, res) => {
  let itemsPerPage = 5;
  if(!req.params.username) {
    res.status(400).json({ success: false, message: 'No username provided' });
  } else if(!req.params.page) {
    res.status(400).json({ success: false, message: 'No page provided' });
  } else {
    let selector = req.user.authenticated? 'title body createdBy createdAt likes likedBy dislikes dislikedBy comments' : 'title body createdBy createdAt likes dislikes comments';
    let page = req.params.page;
    User.findByUsername(req.params.username, (err, user) => {
      if(err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
      } else {
        if(!user) {
          res.status(404).json({ success: false, message: 'User not found' });
        } else {
          Post.find({createdBy: user._id}).populate('createdBy', '_id username first_name last_name').select(selector).sort({ '_id': -1 }).skip((page-1)*itemsPerPage).limit(itemsPerPage).lean().exec((err, posts) => {
            if(err) {
              res.status(500).json({ success: false, message: 'Something went wrong' });
            } else {
              if(!posts) {
                res.status(404).json({ success: false, message: 'No posts found' });
              } else {
                if(req.user.authenticated){
                  posts.forEach(post => {
                    post.totalComments = post.comments.length;
                    post.likedByUser = false;
                    post.dislikedByUser = false;
                    if(includesId(post.likedBy, req.user._id)) {
                      post.likedByUser = true;
                    } else if(includesId(post.dislikedBy, req.user._id)) {
                      post.dislikedByUser = true;
                    }
                    delete post.likedBy;
                    delete post.dislikedBy;
                  });
                } else {
                  posts.forEach(post => {
                    post.totalComments = post.comments.length;
                  });
                }
                res.status(200).json({ success: true, posts: posts });
              }
            }
          });
        }
      }
    });
  }
});

router.get('/get/:id', get_user, (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ success: false, message: 'No post id provided.' });
  } else {
    let selector = req.user.authenticated? 'title body createdBy createdAt likes likedBy dislikes dislikedBy comments' : 'title body createdBy createdAt likes dislikes comments';
    Post.findOne({ _id: req.params.id }).populate('createdBy', '_id username first_name last_name').select(selector).lean().exec((err, post) => {
      if (err) {
        res.status(500).json({ success: false, message: 'Invalid post id' });
      } else {
        if (!post) {
          res.status(404).json({ success: false, message: 'Post not found' });
        } else {
          post.totalComments = post.comments.length;
          if(req.user.authenticated){
            post.likedByUser = false;
            post.dislikedByUser = false;
            if(includesId(post.likedBy, req.user._id)) {
              post.likedByUser = true;
            } else if(includesId(post.dislikedBy, req.user._id)) {
              post.dislikedByUser = true;
            }
            delete post.likedBy;
            delete post.dislikedBy;
          }
          res.status(200).json({ success: true, post: post });
        }
      }
    });
  }
});

router.get('/popular', (req, res) => {
  Post.find().sort({likes: 'desc'}).populate('createdBy', '_id username first_name last_name').limit(5).exec((err, posts) => {
    if(err) {
      res.status(500).json({ success: false, message: 'Something went wrong' });
    } else {
      if(!posts) {
        res.status(404).json({ success: false, message: 'Posts not found' });
      } else {
        res.status(200).json({ success: true, posts: posts });
      }
    }
  });
});

router.get('/count', (req, res) => {
  Post.count({}, (err, count) => {
    if(err) {
      res.status(500).json({ success: false, message: 'Something went wrong' });
    } else {
      res.status(200).json({ success: true, count: count });
    }
  });
});

router.get('/user/:username/count', (req, res) => {
  if(!req.params.username) {
    res.status(400).json({ success: false, message: 'No username provided' });
  } else {
    User.findByUsername(req.params.username, (err, user) => {
      if(err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
      } else {
        if(!user) {
          res.status(404).json({ success: false, message: 'User not found' });
        } else {
          Post.countDocuments({createdBy: user._id}, (err, count) => {
            if(err) {
              res.status(500).json({ success: false, message: 'Something went wrong' });
            } else {
              res.status(200).json({ success: true, count: count });
            }
          });
        }
      }
    });
  }
});

router.put('/update', passport.authenticate('jwt', {session: false}), (req, res) => {
  if(!req.body._id) {
    res.status(400).json({ success: false, message: 'No post id provided' });
  } else {
    Post.findOne({ _id: req.body._id }, (err, post) => {
      if(err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
      } else {
        if(!post) {
          res.status(404).json({ success: false, message: 'Post not found' });
        } else {
          User.findOne({ _id: req.user._id }, (err, user) => {
            if(err) {
              res.status(500).json({ success: false, message: 'Something went wrong' });
            } else {
              if(!user) {
                res.status(404).json({ success: false, message: 'User not found' });
              } else {
                if(!user._id.equals(post.createdBy)) {
                  res.status(401).json({ success: false, message: 'You are not authorized to edit this post.' });
                } else {
                  post.title = req.body.title;
                  post.body = req.body.body;
                  post.save((err) => {
                    if(err) {
                      if(err.errors) {
                        if(err.errors.title) {
                          res.status(400).json({ success: false, message: err.errors.title.message });
                        } else if(err.errors.body) {
                          res.status(400).json({ success: false, message: err.errors.body.message });
                        } else {
                          res.status(400).json({ success: false, message: err });
                        }
                      } else {
                        res.status(500).json({ success: false, message: err });
                      }
                    } else {
                      res.status(200).json({ success: true, message: 'Post Updated!' });
                    }
                  });
                }
              }
            }
          });
        }
      }
    });
  }
});

router.delete('/delete/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  if(!req.params.id) {
    res.status(400).json({ success: false, message: 'No post id provided' });
  } else {
    Post.findOne({ _id: req.params.id }, (err, post) => {
      if(err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
      } else {
        if(!post) {
          res.status(404).json({ success: false, messasge: 'Post not found' });
        } else {
          User.findOne({ _id: req.user._id }, (err, user) => {
            if(err) {
              res.status(500).json({ success: false, message: 'Something went wrong' });
            } else {
              if(!user) {
                res.status(404).json({ success: false, message: 'User not found' });
              } else {
                if(!user._id.equals(post.createdBy)) {
                  res.status(401).json({ success: false, message: 'You are not authorized to delete this post' });
                } else {
                  post.remove((err) => {
                    if(err) {
                      res.status(500).json({ success: false, message: 'Something went wrong' });
                    } else {
                      res.status(200).json({ success: true, message: 'Post deleted!' });
                    }
                  });
                }
              }
            }
          });
        }
      }
    });
  }
});

router.put('/like', passport.authenticate('jwt', {session: false}), (req, res) => {
  if(!req.body.id) {
    res.status(400).json({ success: false, message: 'No post id provided' });
  } else {
    Post.findOne({ _id: req.body.id }).populate('createdBy', '_id').exec((err, post) => {
      if(err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
      } else {
        if(!post) {
          res.status(404).json({ success: false, message: 'Post not found' });
        } else {
          User.findOne({ _id: req.user._id }, (err, user) => {
            if(err) {
              res.status(500).json({ success: false, message: 'Something went wrong' });
            } else {
              if(!user) {
                res.status(404).json({ success: false, message: 'User not found' });
              } else {
                if(user._id.equals(post.createdBy._id)) {
                  res.status(401).json({ success: false, messagse: 'Cannot like your own post' });
                } else {
                  let likeIndex = post.likedBy.indexOf(user._id);
                  if(likeIndex>-1) {
                    post.likes--;
                    post.likedBy.splice(likeIndex, 1);
                    post.save((err) => {
                      if (err) {
                        res.status(500).json({ success: false, message: 'Something went wrong' });
                      } else {
                        res.status(200).json({ success: true, message: 'Post unliked!' });
                      }
                    });
                  } else {
                    let dislikeIndex = post.dislikedBy.indexOf(user._id);
                    if (dislikeIndex>-1) {
                      post.dislikes--;
                      post.dislikedBy.splice(dislikeIndex, 1);
                    }
                    post.likes++;
                    post.likedBy.push(user._id);
                    post.save((err) => {
                      if (err) {
                        res.status(500).json({ success: false, message: 'Something went wrong' });
                      } else {
                        res.status(200).json({ success: true, message: 'Post liked!' });
                      }
                    });
                  }
                }
              }
            }
          });
        }
      }
    });
  }
});

router.put('/dislike', passport.authenticate('jwt', {session: false}), (req, res) => {
  if(!req.body.id) {
    res.status(400).json({ success: false, message: 'No post id provided' });
  } else {
    Post.findOne({ _id: req.body.id }).populate('createdBy', '_id').exec((err, post) => {
      if(err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
      } else {
        if(!post) {
          res.status(404).json({ success: false, message: 'Post not found' });
        } else {
          User.findOne({ _id: req.user._id }, (err, user) => {
            if(err) {
              res.status(500).json({ success: false, message: 'Something went wrong' });
            } else {
              if(!user) {
                res.status(404).json({ success: false, message: 'User not found' });
              } else {
                if(user._id.equals(post.createdBy._id)) {
                  res.status(401).json({ success: false, messagse: 'Cannot dislike your own post' });
                } else {
                  let dislikeIndex = post.dislikedBy.indexOf(user._id);
                  if (dislikeIndex>-1) {
                    post.dislikes--;
                    post.dislikedBy.splice(dislikeIndex, 1);
                    post.save((err) => {
                      if (err) {
                        res.status(500).json({ success: false, message: 'Something went wrong' });
                      } else {
                        res.status(200).json({ success: true, message: 'Post undisliked!' });
                      }
                    });
                  } else {
                    let likeIndex = post.likedBy.indexOf(user._id);
                    if (likeIndex>-1) {
                      post.likes--;
                      post.likedBy.splice(likeIndex, 1);
                    }
                    post.dislikes++;
                    post.dislikedBy.push(user._id);
                    post.save((err) => {
                      if (err) {
                        res.status(500).json({ success: false, message: 'Something went wrong' });
                      } else {
                        res.status(200).json({ success: true, message: 'Post disliked!' });
                      }
                    });
                  }
                }
              }
            }
          });
        }
      }
    });
  }
});

module.exports = router;