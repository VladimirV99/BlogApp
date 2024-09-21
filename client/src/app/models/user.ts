import { Post } from './post';

export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  photo: string;
  bookmarks?: Post[];
  dark_mode?: boolean;
  round_icons?: boolean;
}

export interface CreatedBy {
  _id: string;
  first_name: string;
  last_name: string;
  photo: string;
}
