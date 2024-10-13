import { PassportStatic } from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

import * as config from "./credentials";
import User from "../models/user";
import { Types } from "mongoose";

export default function (passport: PassportStatic) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secret,
  };
  passport.use(
    "jwt",
    new Strategy(opts, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.user_id)
          .select<{
            username: string;
            first_name: string;
            last_name: string;
            photo: string;
            bookmarks: Types.ObjectId[];
          }>("_id username first_name last_name photo bookmarks")
          .lean();
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (err) {
        return done(err);
      }
    })
  );
}
