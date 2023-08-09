import { Channel } from "../../models/channel";
import { Conversation } from "../../models/conversation";

export enum MenuItemType {
  Channel = "Channel",
  CreateChannel = "CreateChannel",
  SearchChannel = "SearchChannel",
  Conversation = "Conversation",
  CreateConversation = "CreateConversation",
}

export interface ChannelMenuItem {
  type: MenuItemType.Channel;
  channel: Channel;
}
export function ChannelMenuItem(channel: Channel): ChannelMenuItem {
  return {
    type: MenuItemType.Channel,
    channel,
  };
}

export interface CreateChannelMenuItem {
  type: MenuItemType.CreateChannel;
  title: string;
}
export function CreateChannelMenuItem(): CreateChannelMenuItem {
  return {
    type: MenuItemType.CreateChannel,
    title: "New Channel",
  };
}

export interface SearchChannelMenuItem {
  type: MenuItemType.SearchChannel;
  title: string;
}
export function SearchChannelMenuItem(): SearchChannelMenuItem {
  return {
    type: MenuItemType.SearchChannel,
    title: "Search Channel",
  };
}

export interface ConversationMenuItem {
  type: MenuItemType.Conversation;
  conversation: Conversation;
}
export function ConversationMenuItem(
  conversation: Conversation
): ConversationMenuItem {
  return {
    type: MenuItemType.Conversation,
    conversation,
  };
}

export interface CreateConversationMenuItem {
  type: MenuItemType.CreateConversation;
  title: string;
}
export function CreateConversationMenuItem(): CreateConversationMenuItem {
  return {
    type: MenuItemType.CreateConversation,
    title: "New Conversation",
  };
}

export const isMenuItemEqual = (a: MenuItem, b: MenuItem) => {
  if (a.type != b.type) {
    return false;
  }

  if (a.type === MenuItemType.Channel && b.type === MenuItemType.Channel) {
    return a.channel.id === b.channel.id;
  }

  if (
    a.type === MenuItemType.Conversation &&
    b.type === MenuItemType.Conversation
  ) {
    return a.conversation.id === b.conversation.id;
  }

  return false;
};

export type MenuItem =
  | ChannelMenuItem
  | CreateChannelMenuItem
  | SearchChannelMenuItem
  | ConversationMenuItem
  | CreateConversationMenuItem;
