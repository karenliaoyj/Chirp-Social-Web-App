import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MessageItem, {
  MessageItemElement,
} from "../../../components/MessageItem/MessageItem";
import { Conversation } from "../../../models/conversation";

import "./ConversationView.scss";
import "../../../components/MessageItem/MessageItem.scss";
import {
  ConversationViewContext,
  initPaginatedMessages,
} from "./ConversationViewContextProvider";
import MainActionView, {
  MainActionState,
} from "../../../components/MainActionView/MainActionView";
import { MessageRequestType } from "../../../models/request";
import SearchMessageModal from "../SearchMessageModal/SearchMessageModal";
import { Message } from "../../../models/message";
import { Nullable } from "../../../utils/types";

interface Props {
  conversation: Conversation;
}
const ConversationViewImpl: React.FC<Props> = (props) => {
  const { conversation } = props;
  const {
    state: { messagesMap },
    actions: { init, sendMessage, loadMore, loadUntil },
  } = useContext(ConversationViewContext);
  const [isSearchMessageModalOpen, setIsSearchMessageModalOpen] =
    useState(false);
  const [navigationTargetMessage, setNavigationTargetMessage] =
    useState<Nullable<Message>>(null);

  const messages = useMemo(() => {
    return messagesMap.get(conversation.id) || initPaginatedMessages;
  }, [conversation.id, messagesMap]);

  const messageListRef = useRef<HTMLDivElement>(null);

  // Note(ihsuanl): hasNewMessageRef indicates if a new message is being added to the list
  const hasNewMessageRef = useRef(false);

  // Note(ihsuanl): prevScrollHeightRef indicates the scrollHeight before loading more items
  const prevScrollHeightRef = useRef(0);

  const [messagesRefs, setMessagesRefs] = useState<
    (React.RefObject<MessageItemElement> | null)[]
  >([]);

  useEffect(() => {
    setMessagesRefs(
      messages.data.map(() => React.createRef<MessageItemElement>())
    );
  }, [messages.data]);

  useEffect(() => {
    (async () => {
      try {
        await init(conversation.id);
      } finally {
        hasNewMessageRef.current = true;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  useEffect(() => {
    if (messageListRef.current) {
      if (hasNewMessageRef && hasNewMessageRef.current) {
        // case: new message being added to the list
        // -> we want the list to be scrolled to the bottom
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        hasNewMessageRef.current = false;
      } else {
        // case: more messages are loaded to the list and appended to the top
        // -> we want to adjust the offset to the correct value
        if (prevScrollHeightRef.current > 0) {
          const scrollTop = messageListRef.current.scrollTop;
          const newScrollHeight = messageListRef.current.scrollHeight;
          const newScrollTop =
            newScrollHeight - prevScrollHeightRef.current + scrollTop;
          messageListRef.current.scrollTop = newScrollTop;
        }
      }
    }
  }, [messages]);

  const onSubmit = useCallback(
    (state: MainActionState) => {
      if (state.textareaStr != "") {
        hasNewMessageRef.current = true;
        sendMessage({
          action: MessageRequestType.Create,
          message: state.textareaStr.trim(),
        });
      }
    },
    [sendMessage]
  );

  const onScroll = useCallback(async () => {
    if (messageListRef.current) {
      if (messageListRef.current.scrollTop === 0 && messages.next > -1) {
        prevScrollHeightRef.current = messageListRef.current.scrollHeight;
        await loadMore(conversation.id);
      }
    }
  }, [conversation.id, loadMore, messages.next]);

  const openSearchMessageModal = useCallback(() => {
    setIsSearchMessageModalOpen(true);
  }, []);

  const closeSearchMessageModal = useCallback(() => {
    setIsSearchMessageModalOpen(false);
  }, []);

  const navigateToMessage = useCallback(
    async (message: Message) => {
      closeSearchMessageModal();
      const targetMessageExists = messages.data.some(
        (it) => it.id === message.id
      );
      if (!targetMessageExists) {
        await loadUntil(conversation.id, message.id);
      }
      setNavigationTargetMessage(message);
    },
    [closeSearchMessageModal, conversation.id, loadUntil, messages.data]
  );

  useEffect(() => {
    const token = setTimeout(() => {
      if (navigationTargetMessage) {
        const index = messages.data.findIndex(
          (m) => m.id === navigationTargetMessage.id
        );
        if (index > -1) {
          messagesRefs[messages.data.length - index - 1]?.current?.navigate();
          setNavigationTargetMessage(null);
        }
      }
    }, 50);
    return () => {
      clearTimeout(token);
    };
  }, [messages.data, navigationTargetMessage, messagesRefs]);

  return (
    <>
      <div className="conversation-container">
        <div className="conversation-header">
          <p className="conversation-title">
            {`${conversation.receiver.firstName} ${conversation.receiver.lastName} (${conversation.receiver.username})`}
          </p>
          <i
            className="conversation-search"
            onClick={openSearchMessageModal}
          ></i>
        </div>
        <div
          ref={messageListRef}
          className="conversation-content"
          onScroll={onScroll}
        >
          {messages.data
            .slice()
            .reverse()
            .map((it, index) => {
              return (
                <MessageItem
                  key={it.id}
                  message={it}
                  ref={messagesRefs[index]}
                />
              );
            })}
        </div>
        <MainActionView onSubmit={onSubmit} />
      </div>
      <SearchMessageModal
        conversation={conversation}
        isOpen={isSearchMessageModalOpen}
        onRequestClose={closeSearchMessageModal}
        onItemClicked={navigateToMessage}
      />
    </>
  );
};

const ConversationView: React.FC<Props> = (props) => {
  return <ConversationViewImpl {...props} />;
};

export default ConversationView;
