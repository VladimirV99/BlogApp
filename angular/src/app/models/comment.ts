import User from './user';

export default interface Comment {
  comment: string;
  createdBy: User;
  createdAt: number;
  replies: Comment[];
}