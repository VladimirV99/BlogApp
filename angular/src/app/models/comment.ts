import User from './user';

export default interface Comment {
  comment: string;
  createdBy: User;
  createdAt: string;
  replies: Comment[];
}