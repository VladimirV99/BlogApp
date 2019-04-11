export default interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  photo: string;
  dark_mode?: boolean;
  round_icons?: boolean;
}