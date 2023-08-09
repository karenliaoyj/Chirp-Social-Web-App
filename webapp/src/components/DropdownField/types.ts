import { Channel } from "../../models/channel";
import { User } from "../../models/user";

export interface DropdownItem<T> {
  key: string;
  value: T;
}

export const convertUsersToDropdownItems = (
  users: User[]
): DropdownItem<User>[] => {
  return users.map((it) => ({
    key: `${it.username} (${it.firstName} ${it.lastName})`,
    value: it,
  }));
};

export const convertChannelsToDropdownItems = (
  channels: Channel[]
): DropdownItem<Channel>[] => {
  return channels.map((it) => ({
    key: `${it.name}`,
    value: it,
  }));
};
