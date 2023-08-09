import { Nullable } from "../utils/types";
import { User } from "./user";

export enum ChannelType {
  Public = "public",
  Private = "private",
  Create = "Create",
  Search = "Search",
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  type: ChannelType;
  users: User[]; // Note: all the users in the conversation, including the current user
}

export const StaticChannel = (
  name: string,
  type: ChannelType = ChannelType.Public
): Channel => {
  return {
    id: name,
    name,
    description: "",
    type,
    users: [],
  };
};

export const DEFAULT_CHANNELS = [
  StaticChannel("New Channel", ChannelType.Create),
  StaticChannel("Search Channel", ChannelType.Search),
];

export interface CreateChannelFormState {
  name: string;
  description: string;
  type: string;
  members: string[];
}

export interface ChannelCreateErrorState {
  nameError?: string;
  descriptionError?: string;
}

export type ChannelCreateState = CreateChannelFormState &
  ChannelCreateErrorState;

export interface SearchChannelFormState {
  channel: Nullable<Channel>;
}
