import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ChannelMenuItem,
  isMenuItemEqual,
  MenuItem,
  MenuItemType,
} from "../../components/CollapsibleMenuItem/types";

import { ContentContainer } from "../../components/ContentContainer/ContentContainer";
import {
  CreateChannelFormState,
  SearchChannelFormState,
} from "../../models/channel";
import { Nullable } from "../../utils/types";
import ChannelView from "./ChannelView/ChannelView";
import ConversationView from "./ConversationView/ConversationView";
import { SecondaryContent, SecondaryContentType, ThreadContent } from "./types";

import "./HomePage.scss";
import CreateConversationModal from "./CreateConversationModal/CreateConversationModal";
import { CreateConversationFormState } from "../../models/conversation";
import { useErrorContext } from "../../contexts/ErrorContextProvider";
import { ConversationMenuListContext } from "../../contexts/ConversationMenuListProvider";
import CreateChannelModal from "./CreateChannelModal/CreateChannelModal";
import { Post } from "../../models/post";
import SearchChannelModal from "./SearchChannelModal/SearchChannelModal";
import { ChannelMenuListContext } from "../../contexts/ChannelMenuListProvider";
import { ChannelViewContext } from "./ChannelView/ChannelViewContextProvider";
import { useAPIContext } from "../../contexts/APIContextProvider";

const HomePage: React.FC = () => {
  const { apiClient } = useAPIContext();
  const [secondaryContent, setSecondaryContent] =
    useState<Nullable<SecondaryContent>>(null);
  const [selectedItem, setSelectedItem] = useState<Nullable<MenuItem>>(null);
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] =
    useState(false);
  const [isSearchChannelModalOpen, setIsSearchChannelModalOpen] =
    useState(false);
  const [isCreateConversationModalOpen, setIsCreateConversationModalOpen] =
    useState(false);
  const { handleError } = useErrorContext();

  const {
    state: { channels },
    actions: { createChannel, joinChannel },
  } = useContext(ChannelMenuListContext);

  const {
    actions: { createConversation, updateLocalUnreadCount },
  } = useContext(ConversationMenuListContext);

  const {
    state: { channelId, postMap },
  } = useContext(ChannelViewContext);

  useEffect(() => {
    if (
      secondaryContent &&
      secondaryContent.type === SecondaryContentType.Thread
    ) {
      const postList = postMap.get(channelId) || [];
      const currPost = postList.find(
        (it) => it.id === secondaryContent.post.id
      );
      if (currPost) {
        setSecondaryContent((prevState) => {
          if (prevState == null) {
            return prevState;
          }
          return {
            ...prevState,
            post: {
              ...prevState.post,
              ...currPost,
            },
          };
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, postMap]);

  useEffect(() => {
    if (channels.length === 0) return;
    if (selectedItem == null) {
      setSelectedItem(ChannelMenuItem(channels[0]));
    } else if (selectedItem.type === MenuItemType.Channel) {
      if (channels.findIndex((it) => it.id === selectedItem.channel.id) < 0) {
        setSelectedItem(ChannelMenuItem(channels[0]));
      }
    }
  }, [channels, selectedItem]);

  const toggleThread = useCallback(
    (post: Post) => {
      setSecondaryContent(ThreadContent(post));
    },
    [setSecondaryContent]
  );

  const retrieveChannel = useCallback(
    async (id: string) => {
      const response = await apiClient.getChannelByID(id);
      setSelectedItem(ChannelMenuItem(response.channel));
    },
    [apiClient]
  );

  const onMenuItemClicked = useCallback(
    (item: MenuItem) => {
      if (selectedItem != null && isMenuItemEqual(item, selectedItem)) {
        return;
      }

      switch (item.type) {
        case MenuItemType.CreateChannel:
          setIsCreateChannelModalOpen(true);
          return;
        case MenuItemType.SearchChannel:
          setIsSearchChannelModalOpen(true);
          return;
        case MenuItemType.CreateConversation:
          setIsCreateConversationModalOpen(true);
          return;
        case MenuItemType.Conversation:
          updateLocalUnreadCount(item.conversation);
          break;
        case MenuItemType.Channel:
          retrieveChannel(item.channel.id);
          break;
        default:
        // does nothing
      }

      setSelectedItem(item);
      setSecondaryContent(null);
    },
    [selectedItem, updateLocalUnreadCount, retrieveChannel]
  );

  const onSecondaryContentDismissed = useCallback(() => {
    setSecondaryContent(null);
  }, []);

  const onChannelCreate = useCallback(
    async (state: CreateChannelFormState) => {
      try {
        if (state.name && state.members) {
          await createChannel(
            state.name,
            state.description,
            state.type,
            state.members
          );
        } else if (state.name) {
          await createChannel(state.name, state.description, state.type, []);
        }
        setIsCreateChannelModalOpen(false);
      } catch (e: any) {
        handleError(e);
      }
    },
    [createChannel, handleError]
  );

  const onChannelSearch = useCallback(
    async (state: SearchChannelFormState) => {
      try {
        if (state.channel) {
          await joinChannel(state.channel.id);
          setIsSearchChannelModalOpen(false);
        }
      } catch (e: any) {
        handleError(e);
      }
    },
    [joinChannel, handleError]
  );

  const onConversationCreate = useCallback(
    async (state: CreateConversationFormState) => {
      try {
        if (state.receiver) {
          await createConversation(state.receiver.id);
          setIsCreateConversationModalOpen(false);
        }
      } catch (e: any) {
        handleError(e);
      }
    },
    [createConversation, handleError]
  );

  const renderContentView = useCallback(() => {
    if (selectedItem == null) {
      return null;
    }
    switch (selectedItem.type) {
      case MenuItemType.Channel:
        return (
          <ChannelView
            channel={selectedItem.channel}
            toggleThread={toggleThread}
          />
        );
      case MenuItemType.Conversation:
        return <ConversationView conversation={selectedItem.conversation} />;
      default:
        // Does nothing
        return;
    }
  }, [selectedItem, toggleThread]);

  return (
    <>
      <ContentContainer
        secondaryContent={secondaryContent}
        onSecondaryContentDismissed={onSecondaryContentDismissed}
        selectedItem={selectedItem}
        onMenuItemClicked={onMenuItemClicked}
      >
        {renderContentView()}
      </ContentContainer>
      <CreateChannelModal
        isOpen={isCreateChannelModalOpen}
        onRequestClose={() => {
          setIsCreateChannelModalOpen(false);
        }}
        onCreate={onChannelCreate}
      />
      <SearchChannelModal
        isOpen={isSearchChannelModalOpen}
        onRequestClose={() => {
          setIsSearchChannelModalOpen(false);
        }}
        onCreate={onChannelSearch}
      />
      <CreateConversationModal
        isOpen={isCreateConversationModalOpen}
        onRequestClose={() => {
          setIsCreateConversationModalOpen(false);
        }}
        onCreate={onConversationCreate}
      />
    </>
  );
};

export default HomePage;
