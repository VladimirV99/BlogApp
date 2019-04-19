const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let titleLengthChecker = (title) => {
  if (!title || title.length < 5 || title.length > 30)
    return false;
  return true;
};

let titleValidityChecker = (title) => {
  if (!title)
    return false;
  const usernameRegExp = new RegExp(/^[a-zA-Z0-9\-\s]+$/);
  return usernameRegExp.test(title);
};

const titleValidators = [
  {
    validator: titleLengthChecker,
    message: 'Title must be more than 5 characters but no more than 50'
  },
  {
    validator: titleValidityChecker,
    message: 'Title must be alphanumeric'
  }
];

let bodyLengthChecker = (body) => {
  if (!body || body.length < 5 || body.length > 500)
    return false;
  return true;
};

const bodyValidators = [
  {
    validator: bodyLengthChecker,
    message: 'Body must be more than 5 characters but no more than 500.'
  }
];

const PostSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    validate: titleValidators
  },
  body: {
    type: String,
    required: true,
    validate: bodyValidators
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: {
    type: Number,
    default: 0
  },
  dislikedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
});

const Post = module.exports = mongoose.model('Post', PostSchema);

module.exports.getCommentCount = function(post_id, callback) {
  Post.findById(post_id).select('comments').exec((err, post) => {
    if(err) {
      callback(err);
    } else {
      if(!post) {
        callback(null, false);
      } else {
        callback(null, post.comments.length);
      }
    }
  });
}

// Normal include method doesn't work on ObjectIds
function includesId(array, id) {
  if(!array)
    return false;
  for(let i = 0; i < array.length; i++) {
    if(array[i].equals(id)){
      return true;
    }
  }
  return false;
}

function addCommentInformation(post) {
  post.totalComments = post.comments? post.comments.length : 0;
  delete post.comments;
}

function addUserInformation(post, user) {
  post.bookmarked = includesId(user.bookmarks, post._id);
  post.likedByUser = false;
  post.dislikedByUser = false;
  if(includesId(post.likedBy, user._id)) {
    post.likedByUser = true;
  } else if(includesId(post.dislikedBy, user._id)) {
    post.dislikedByUser = true;
  }
  delete post.likedBy;
  delete post.dislikedBy;
}

module.exports.populatePosts = function(posts, user) {
  if(user && user.authenticated) {
    posts.forEach(post => {
      addCommentInformation(post);
      addUserInformation(post, user);
    });
  } else {
    posts.forEach(post => {
      addCommentInformation(post);
    });
  }
  return posts;
}

module.exports.populatePost = function(post, user) {
  addCommentInformation(post);
  if(user && user.authenticated) {
    addUserInformation(post, user);
  }
  return post;
}