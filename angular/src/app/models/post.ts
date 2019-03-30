export default interface Post {
  title: string;
  body: string;
  createdBy: {
    username: string;
    first_name: string;
    last_name: string;
  };
  createdAt: string;
  likes: number;
  likedByUser: boolean;
  dislikes: number;
  dislikedByUser: boolean;
}