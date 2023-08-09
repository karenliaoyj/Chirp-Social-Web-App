import { Nullable } from "../utils/types";
import { User } from "./user";

export interface Message {
  id: string;
  createdAt: string;
  readAt: Nullable<string>;
  content: string;
  sender: User;
}

export interface PaginatedMessageList {
  count: number;
  next: Nullable<string>;
  previous: Nullable<string>;
  results: Message[];
}
