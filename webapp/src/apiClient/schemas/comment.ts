import * as yup from "yup";
import { Comment } from "../../models/comment";
import { UserSchema } from "./user";

export const CommentSchema: yup.Schema<Comment> = yup
  .object<Comment>({
    id: yup.string().required(),
    postId: yup.string().required(),
    user: UserSchema,
    createdAt: yup.string().required(),
    content: yup.string().required(),
  })
  .required()
  .camelCase();
