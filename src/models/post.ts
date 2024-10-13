import { marked } from "marked";
import { Schema, Types, model } from "mongoose";

interface IPost {
  title: string;
  body: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  likes: number;
  likedBy: Types.ObjectId[];
  dislikes: number;
  dislikedBy: Types.ObjectId[];
  comments: Types.ObjectId[];
}

let titleLengthChecker = (title: string) => {
  if (!title || title.length < 1 || title.length > 60) return false;
  return true;
};

let titleValidityChecker = (title: string) => {
  if (!title) return false;
  const usernameRegExp = new RegExp(/^[a-zA-Z0-9\-\s]+$/);
  return usernameRegExp.test(title);
};

const titleValidators = [
  {
    validator: titleLengthChecker,
    message: "Title must be at least 1 character but no more than 60",
  },
  {
    validator: titleValidityChecker,
    message: "Title must be alphanumeric",
  },
];

let bodyLengthChecker = (body: string) => {
  if (!body || body.length < 5 || body.length > 1500) return false;
  return true;
};

const bodyValidators = [
  {
    validator: bodyLengthChecker,
    message: "Body must be more than 5 characters but no more than 1500.",
  },
];

const PostSchema = new Schema<IPost>({
  title: {
    type: String,
    required: true,
    validate: titleValidators,
  },
  body: {
    type: String,
    required: true,
    validate: bodyValidators,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  dislikes: {
    type: Number,
    default: 0,
  },
  dislikedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

interface UnpopulatedPost {
  _id: Types.ObjectId;
  title: string;
  body: string;
  createdBy: CreatedBy | Types.ObjectId;
  createdAt: Date;
  likes: number;
  likedBy?: Types.ObjectId[];
  dislikes: number;
  dislikedBy?: Types.ObjectId[];
  comments: Types.ObjectId[];
}

interface PopulatedPost {
  _id: Types.ObjectId;
  title: string;
  body: string;
  createdBy: CreatedBy | Types.ObjectId;
  createdAt: Date;
  likes: number;
  likedByUser?: boolean;
  dislikes: number;
  dislikedByUser?: boolean;
  bookmarked?: boolean;
  totalComments: number;
}

interface CreatedBy {
  _id: Types.ObjectId;
  username: string;
  first_name: string;
  last_name: string;
}

// Normal include method doesn't work on ObjectIds
function includesId(array: Types.ObjectId[], id: Types.ObjectId) {
  if (!array) return false;
  for (let i = 0; i < array.length; i++) {
    if (array[i].equals(id)) {
      return true;
    }
  }
  return false;
}

export async function populatePost(
  post: UnpopulatedPost,
  user: { _id: Types.ObjectId } | null,
  translate = true
): Promise<PopulatedPost> {
  if (user) {
    return {
      _id: post._id,
      title: post.title,
      body: translate ? await marked.parse(post.body) : post.body,
      totalComments: post.comments.length,
      createdAt: post.createdAt,
      createdBy: post.createdBy,
      likes: post.likes,
      likedByUser: includesId(post.likedBy || [], user._id),
      dislikes: post.dislikes,
      dislikedByUser: includesId(post.dislikedBy || [], user._id),
    };
  } else {
    return {
      _id: post._id,
      title: post.title,
      body: translate ? await marked.parse(post.body) : post.body,
      totalComments: post.comments.length,
      createdAt: post.createdAt,
      createdBy: post.createdBy,
      likes: post.likes,
      dislikes: post.dislikes,
    };
  }
}

export async function populatePosts(
  posts: UnpopulatedPost[],
  user: { _id: Types.ObjectId } | null,
  translate = true
): Promise<PopulatedPost[]> {
  let populatedPosts: PopulatedPost[] = [];
  for (const post of posts) {
    populatedPosts.push(await populatePost(post, user, translate));
  }
  return populatedPosts;
}

const Post = model<IPost>("Post", PostSchema);
export default Post;
