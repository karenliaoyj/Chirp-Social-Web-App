import { Conversation } from "./conversation";
import { User } from "./user";
import { Channel } from "./channel";
import { PaginatedMessageList } from "./message";
import { Post } from "./post";

export interface AuthResponse {
  authToken: string;
}

export interface UserResponse {
  user: User;
}

export interface ChannelResponse {
  channel: Channel;
}

export interface ChannelListResponse {
  channels: Channel[];
}

export interface UserListResponse {
  users: User[];
}

export interface ConversationResponse {
  conversation: Conversation;
}

export interface ConversationListResponse {
  conversations: Conversation[];
}

export interface ChannelResponse {
  channel: Channel;
}

export interface MessageListResponse {
  messages: PaginatedMessageList;
}

export interface PostListResponse {
  posts: Post[];
}
