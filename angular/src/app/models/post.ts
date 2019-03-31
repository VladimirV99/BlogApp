import Comment from './comment';
import User from './user';

export default interface Post {
  _id: string;
  title: string;
  body: string;
  createdBy: User;
  createdAt: number;
  likes: number;
  likedByUser: boolean;
  dislikes: number;
  dislikedByUser: boolean;
  totalComments?: number;
  comments?: Comment[];
}