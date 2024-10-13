import { Schema, Types, model } from "mongoose";

interface IComment {
  comment: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  parentPost?: Types.ObjectId;
  parentComment?: Types.ObjectId;
  replies: Types.ObjectId[];
}

const commentLengthChecker = (comment: string) => {
  if (!comment || comment.length < 1 || comment.length > 500) return false;
  return true;
};

const commentValidators = [
  {
    validator: commentLengthChecker,
    message: "Comments may not exceed 500 characters.",
  },
];

const CommentSchema = new Schema<IComment>({
  comment: {
    type: String,
    validate: commentValidators,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentPost: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
  },
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

const Comment = model<IComment>("Comment", CommentSchema);
export default Comment;
