import { Nullable } from "../utils/types";
import { User } from "./user";

export interface Conversation {
  id: string;
  users: User[]; // Note: all the users in the conversation, including the current user
  receiver: User; // Note: representative receiver
  createdAt: string;
  unreadCount: number;
  type: ConversationType;
}

export enum ConversationType {
  DirectMessage = "DirectMessage",
  Create = "Create",
}

export const StaticConversation = (
  title: string,
  type: ConversationType
): Conversation => {
  return {
    id: title,
    users: [],
    receiver: {
      id: "dummy-id",
      username: "dummy-username",
      email: "dummy-email",
      firstName: "dummy-firstName",
      lastName: "dummy-lastName",
    },
    createdAt: "",
    unreadCount: 0,
    type,
  };
};

export const DEFAULT_CONVERSATIONS = [
  StaticConversation("New Conversation", ConversationType.Create),
];

export interface CreateConversationFormState {
  receiver: Nullable<User>;
}
