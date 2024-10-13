import { Comment } from './comment';
import { User, CreatedBy } from './user';

// TODO: Create a more granular model for each use case.
// createdBy should have createdByType
// likedBy, dislikedBy, bookmarked and comments should not always be there.
export interface Post {
  _id: string;
  title: string;
  body: string;
  createdBy: User;
  createdAt: string;
  likes: number;
  likedBy?: User[];
  likedByUser: boolean;
  dislikes: number;
  dislikedBy?: User[];
  dislikedByUser: boolean;
  bookmarked: boolean;
  totalComments?: number;
  comments?: Comment[];
}

export interface CreatePostRequest {
  title: string;
  body: string;
}

export interface CreatePostResponse {
  _id: string;
  title: string;
  body: string;
  createdBy: string;
  createdAt: string;
}

// TODO: This should not contain likedBy, dislikedBy or comments.
export interface GetPostsResponse {
  posts: Post[];
}

// TODO: This should not contain likedBy, dislikedBy or comments.
export interface GetPostResponse {
  post: Post;
}

export interface EditPostRequest {
  _id: string;
  title: string;
  body: string;
}

export interface GetLikesResponse {
  post: {
    likes: number;
    likedBy: User[];
  };
}

export interface GetDisikesResponse {
  post: {
    dislikes: number;
    dislikedBy: User[];
  };
}
