import { CreatedBy, User } from './user';

export interface Comment {
  _id: string; // TODO
  comment: string;
  createdBy: User;
  createdAt: string;
  replies: Comment[];
}

export interface BasicComment {
  _id: string;
  comment: string;
  createdBy: CreatedBy;
  createdAt: string;
  replies: number;
}

export interface GetCommentsResponse {
  comments: BasicComment[];
}

export interface PostCommentRequest {
  parent_post: string;
  comment: string;
}

export interface PostCommentResponse {
  comment: BasicComment;
}

export interface PostReplyRequest {
  parent_comment: string;
  comment: string;
}
