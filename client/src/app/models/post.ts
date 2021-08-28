import Comment from './comment';
import User from './user';

export default interface Post {
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
