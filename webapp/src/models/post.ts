import { User } from "./user";
import { Comment } from "./comment";

export interface Post {
  id: string;
  user: User;
  createdAt: string;
  content: string;
  comments: Comment[];
}
