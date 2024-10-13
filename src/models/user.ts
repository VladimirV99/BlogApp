import { Document, Model, Schema, Types, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import * as config from "../config/credentials";

interface IUser {
  first_name: string;
  last_name: string;
  photo: string;
  email: string;
  username: string;
  password: string;
  bookmarks: Types.ObjectId[];
  dark_mode: boolean;
  round_icons: boolean;
}

interface IUserMethods {
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  getToken: () => string;
}

interface IUserModel extends Model<IUser, {}, IUserMethods> {
  findByUsername: (
    username: string
  ) => Promise<(IUser & IUserMethods & { _id: Types.ObjectId }) | null>;
}

const nameLengthChecker = (name: string) => {
  if (!name || name.length > 30) return false;
  return true;
};

const nameValidityChecker = (name: string) => {
  if (!name) return false;
  const nameRegExp = new RegExp(/^[a-zA-Z0-9'-]+$/);
  return nameRegExp.test(name);
};

const nameValidators = [
  {
    validator: nameLengthChecker,
    message: "Name must be no more than 15 characters",
  },
  {
    validator: nameValidityChecker,
    message: "Name must not have any special characters",
  },
];

const emailValidityChecker = (email: string) => {
  if (!email) return false;
  const emailRegExp = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  return emailRegExp.test(email);
};

const emailValidators = [
  {
    validator: emailValidityChecker,
    message: "Must be a valid e-mail",
  },
];

const usernameLengthChecker = (username: string) => {
  if (!username || username.length < 3 || username.length > 15) return false;
  return true;
};

const usernameValidityChecker = (username: string) => {
  if (!username) return false;
  const usernameRegExp = new RegExp(/^[a-zA-Z0-9'-]+$/);
  return usernameRegExp.test(username);
};

const usernameValidators = [
  {
    validator: usernameLengthChecker,
    message: "Username must be at least 3 characters but no more than 15",
  },
  {
    validator: usernameValidityChecker,
    message: "Username must not have any special characters",
  },
];

const passwordLengthChecker = (password: string) => {
  if (!password || password.length < 8 || password.length > 35) return false;
  return true;
};

const passwordValidityChecker = (password: string) => {
  if (!password) return false;
  const passwordRegExp = new RegExp(
    /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d]).{0,}$/
  );
  return passwordRegExp.test(password);
};

const passwordValidators = [
  {
    validator: passwordLengthChecker,
    message: "Password must be at least 8 characters but no more than 35",
  },
  {
    validator: passwordValidityChecker,
    message:
      "Must have at least one uppercase, lowercase, special character, and number",
  },
];

const UserSchema = new Schema<IUser, IUserModel, IUserMethods>({
  first_name: {
    type: String,
    required: [true, "First name is required"],
    validate: nameValidators,
  },
  last_name: {
    type: String,
    required: [true, "Last name is required"],
    validate: nameValidators,
  },
  photo: {
    type: String,
    default: "uploads/no-user.png",
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: emailValidators,
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    validate: usernameValidators,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  bookmarks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  dark_mode: {
    type: Boolean,
    default: false,
  },
  round_icons: {
    type: Boolean,
    default: false,
  },
});

UserSchema.statics.findByUsername = function (
  username: string
): Promise<(IUser & IUserMethods & { _id: Types.ObjectId }) | null> {
  return User.findOne({ username: username });
};

class StatusError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

UserSchema.pre("save", async function (this, next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  for (const validatorEntry of passwordValidators) {
    if (validatorEntry.validator(this.password)) {
      return next(new StatusError(400, validatorEntry.message));
    }
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    return next();
  } catch (err) {
    return next(new StatusError(500, "Something went wrong"));
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as IUser;
  return bcrypt.compare(candidatePassword, user.password);
};

UserSchema.methods.getToken = function () {
  const user = this as Document;
  return jwt.sign({ user_id: user._id }, config.secret, {
    expiresIn: 604800, // 1 week
  });
};

const User = model<IUser, IUserModel>("User", UserSchema);
export default User;
