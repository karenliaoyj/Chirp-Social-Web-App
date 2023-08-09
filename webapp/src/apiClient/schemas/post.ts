import * as yup from "yup";
import { Post } from "../../models/post";
import { CommentSchema } from "./comment";
import { UserSchema } from "./user";
import { PostListResponse } from "../../models/response";

export const PostSchema: yup.Schema<Post> = yup
  .object<Post>({
    id: yup.string().required(),
    user: UserSchema,
    createdAt: yup.string().required(),
    content: yup.string().required(),
    comments: yup.array().defined().of(CommentSchema),
  })
  .required()
  .camelCase();

export const PostListResponseSchema: yup.Schema<PostListResponse> = yup
  .object<PostListResponse>({
    posts: yup.array().defined().of(PostSchema),
  })
  .required()
  .camelCase();
