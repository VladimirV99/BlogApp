// TODO: Move to dotenv
export const database =
  process.env.DB_HOST || "mongodb://root:blog@localhost:27017/blog";
export const secret = process.env.PASSPORT_SECRET || "blog";
