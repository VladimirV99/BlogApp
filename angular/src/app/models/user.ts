import Post from './post';

export default interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  photo: string;
  bookmarks?: Post[];
  dark_mode?: boolean;
  round_icons?: boolean;
}