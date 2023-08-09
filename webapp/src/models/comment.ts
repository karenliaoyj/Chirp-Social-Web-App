import { User } from "./user";

export interface Comment {
  id: string;
  postId: string;
  user: User;
  createdAt: string;
  content: string;
}
