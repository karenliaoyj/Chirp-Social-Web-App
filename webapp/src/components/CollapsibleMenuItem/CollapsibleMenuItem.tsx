import classNames from "classnames";
import React, { useCallback, useMemo } from "react";
import {
  MenuItem,
  MenuItemType,
  ChannelMenuItem,
  ConversationMenuItem,
  CreateChannelMenuItem,
  SearchChannelMenuItem,
  CreateConversationMenuItem,
} from "./types";

import "./CollapsibleMenuItem.scss";

export enum MenutItemIconType {
  // channel
  PublicChannel = "PublicChannel",
  PrivateChannel = "PrivateChannel",
  CreateChannel = "CreateChannel",
  SearchChannel = "SearchChannel",
  // conversation
  DirectMessage = "DirectMessage",
  CreateConversation = "CreateConversation",
}

const getIconClassByType = (type: MenutItemIconType) => {
  switch (type) {
    case MenutItemIconType.PublicChannel:
      return "menu-icon-public-channel";
    case MenutItemIconType.PrivateChannel:
      return "menu-icon-private-channel";
    case MenutItemIconType.CreateChannel:
    case MenutItemIconType.CreateConversation:
      return "menu-icon-create";
    case MenutItemIconType.SearchChannel:
      return "menu-icon-search";
    case MenutItemIconType.DirectMessage:
      return "menu-icon-direct-message";
    default:
      return "";
  }
};

interface Props {
  item: MenuItem;
  onItemClicked: (item: MenuItem) => void;
  iconType: MenutItemIconType;
  isSelected: boolean;
}
const CollapsibleMenuItem: React.FC<Props> = (props) => {
  const { item, onItemClicked, iconType, isSelected } = props;

  const renderMenuItem = useCallback(() => {
    switch (item.type) {
      case MenuItemType.Channel:
        return <ChannelMenuItemImpl item={item} isSelected={isSelected} />;
      case MenuItemType.CreateChannel:
        return <CreateChannelMenuItemImpl item={item} />;
      case MenuItemType.SearchChannel:
        return <SearchChannelMenuItemImpl item={item} />;
      case MenuItemType.Conversation:
        return <ConversationMenuItemImpl item={item} isSelected={isSelected} />;
      case MenuItemType.CreateConversation:
        return <CreateConversationMenuItemImpl item={item} />;
      default:
        throw new Error("CollapsibleMenuItem: Unexpected menu item type");
    }
  }, [item, isSelected]);

  const onClicked = useCallback(() => {
    onItemClicked(item);
  }, [item, onItemClicked]);

  return (
    <div
      className={classNames(
        "menu-item-container",
        isSelected ? "menu-item-container--selected" : ""
      )}
      onClick={onClicked}
    >
      <i className={getIconClassByType(iconType)}></i>
      <div className="menu-item">{renderMenuItem()}</div>
    </div>
  );
};

interface ChannelItemProps {
  item: ChannelMenuItem;
  isSelected: boolean;
}
const ChannelMenuItemImpl: React.FC<ChannelItemProps> = (props) => {
  const { item, isSelected } = props;

  return (
    <div
      className={classNames(
        "menu-item-title",
        isSelected ? "menu-item-title--selected" : ""
      )}
    >
      {item.channel.name}
    </div>
  );
};

interface CreateChannelItemProps {
  item: CreateChannelMenuItem;
}
const CreateChannelMenuItemImpl: React.FC<CreateChannelItemProps> = (props) => {
  const { item } = props;
  return <div className="menu-item-title">{item.title}</div>;
};

interface SearchChannelItemProps {
  item: SearchChannelMenuItem;
}
const SearchChannelMenuItemImpl: React.FC<SearchChannelItemProps> = (props) => {
  const { item } = props;
  return <div className="menu-item-title">{item.title}</div>;
};

interface ConversationItemProps {
  item: ConversationMenuItem;
  isSelected: boolean;
}
const ConversationMenuItemImpl: React.FC<ConversationItemProps> = (props) => {
  const { item, isSelected } = props;

  const unreadCountStr = useMemo(
    () =>
      item.conversation.unreadCount > 99
        ? "99+"
        : item.conversation.unreadCount,
    [item.conversation.unreadCount]
  );

  const hasUnreadMessage = useMemo(() => {
    return !isSelected && item.conversation.unreadCount > 0;
  }, [isSelected, item.conversation.unreadCount]);

  return (
    <div className="conversation-menu-item-wrapper">
      <div
        className={classNames(
          "menu-item-title",
          hasUnreadMessage ? "menu-item-title--unread" : "",
          isSelected ? "menu-item-title--selected" : ""
        )}
      >
        {item.conversation.receiver.username}
      </div>
      {hasUnreadMessage && (
        <div className="menu-item-count-container">
          <div className="menu-item-count">{unreadCountStr}</div>
        </div>
      )}
    </div>
  );
};

interface CreateConversationItemProps {
  item: CreateConversationMenuItem;
}
const CreateConversationMenuItemImpl: React.FC<CreateConversationItemProps> = (
  props
) => {
  const { item } = props;
  return <div className="menu-item-title">{item.title}</div>;
};

export default CollapsibleMenuItem;
