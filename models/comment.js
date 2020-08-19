const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let commentLengthChecker = (comment) => {
  if (!comment || comment.length < 1 || comment.length > 500)
    return false;
  return true;
};

const commentValidators = [
  {
    validator: commentLengthChecker,
    message: 'Comments may not exceed 500 characters.'
  }
];

const CommentSchema = mongoose.Schema({
  comment: {
    type: String,
    validate: commentValidators,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  parentPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
});

const Comment = module.exports = mongoose.model('Comment', CommentSchema);