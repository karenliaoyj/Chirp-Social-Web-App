import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { ConversationMenuListContext } from "../../contexts/ConversationMenuListProvider";
import {
  ConversationType,
  DEFAULT_CONVERSATIONS,
} from "../../models/conversation";
import { Nullable } from "../../utils/types";
import CollapsibleMenuItem, {
  MenutItemIconType,
} from "../CollapsibleMenuItem/CollapsibleMenuItem";
import {
  ConversationMenuItem,
  CreateConversationMenuItem,
  MenuItem,
  MenuItemType,
} from "../CollapsibleMenuItem/types";

import "./ConversationMenuList.scss";

interface ConversationMenuListProps {
  selectedItem: Nullable<MenuItem>;
  onConversationItemSelected: (item: MenuItem) => void;
}
const ConversationMenuList: React.FC<ConversationMenuListProps> = (props) => {
  const { selectedItem, onConversationItemSelected } = props;
  const {
    state: { conversations: remoteConversations },
    actions: { getConversations },
  } = useContext(ConversationMenuListContext);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      await getConversations();
    }, 6000);

    // Call the function immediately to fetch conversations when component mounts
    (async () => {
      await getConversations();
    })();

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const conversations = useMemo(() => {
    const conversations = [];
    remoteConversations.forEach((it) => {
      conversations.push(it);
    });
    conversations.push(DEFAULT_CONVERSATIONS[DEFAULT_CONVERSATIONS.length - 1]);
    return conversations;
  }, [remoteConversations]);

  const onItemClicked = useCallback(
    (item: MenuItem) => {
      onConversationItemSelected(item);
    },
    [onConversationItemSelected]
  );

  const renderMenuItem = useCallback(() => {
    return conversations.map((it) => {
      switch (it.type) {
        case ConversationType.DirectMessage:
          return (
            <CollapsibleMenuItem
              key={`conversation-menu-item-${it.id}`}
              item={ConversationMenuItem(it)}
              onItemClicked={onItemClicked}
              iconType={MenutItemIconType.DirectMessage}
              isSelected={
                selectedItem != null &&
                selectedItem.type === MenuItemType.Conversation &&
                selectedItem.conversation.id == it.id
              }
            />
          );
        case ConversationType.Create:
          return (
            <CollapsibleMenuItem
              key={`conversation-menu-item-${it.id}`}
              item={CreateConversationMenuItem()}
              onItemClicked={onItemClicked}
              iconType={MenutItemIconType.CreateConversation}
              isSelected={false}
            />
          );
      }
    });
  }, [conversations, onItemClicked, selectedItem]);

  return <div className="conversation-menu-container">{renderMenuItem()}</div>;
};

export default ConversationMenuList;
