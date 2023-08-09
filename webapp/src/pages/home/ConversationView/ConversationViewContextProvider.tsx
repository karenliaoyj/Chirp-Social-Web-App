import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useWebSocket from "react-use-websocket";
import { MessageSchema } from "../../../apiClient/schemas/message";
import { useAPIContext } from "../../../contexts/APIContextProvider";
import { Message } from "../../../models/message";
import {
  MessageNotifyReadAllRequestPayload,
  MessageReadRequestPayload,
  MessageRequestPayload,
  MessageRequestType,
} from "../../../models/request";
import { stringifyQueryParams } from "../../../utils/request";
import { Nullable } from "../../../utils/types";
import {
  PAGE_SIZE,
  Pagination,
  makePagination,
} from "../../../models/pagination";
import { MessageListResponse } from "../../../models/response";
import { useErrorContext } from "../../../contexts/ErrorContextProvider";
import { useUser } from "../../../contexts/UserContextProvider";
import { REACT_APP_CHIRP_WS_ENDPOINT } from "../../../config";

interface ConversationViewState {
  // key: conversationId, value: list of paginated messages
  conversationId: Nullable<string>;
  messagesMap: Map<string, Pagination<Message[]>>;
}

const initState: ConversationViewState = {
  conversationId: null,
  messagesMap: new Map<string, Pagination<Message[]>>(),
};

export const initPaginatedMessages: Pagination<Message[]> = {
  data: [],
  next: -1,
  count: 0,
};

export enum ConversationViewActionType {
  Init = "init",
  SendMessage = "sendMessage",
  LoadMoreMessage = "loadMore",
  LoadUntilMessage = "loadUntil",
}

interface WebSocketState {
  url: Nullable<string>;
}
const useMakeActions = (
  state: ConversationViewState,
  setState: Dispatch<SetStateAction<ConversationViewState>>
) => {
  const { apiClient } = useAPIContext();
  const { user } = useUser();
  const [websocketState, setWebsocketState] = useState<WebSocketState>({
    url: null,
  });
  const { sendMessage, lastJsonMessage } = useWebSocket<{
    [key in string]: any;
  }>(websocketState.url);
  // Note(ihsuanl): hasNewMessageRef indicates if a new message is being fetched
  const hasNewMessageRef = useRef(true);
  const { handleError } = useErrorContext();

  const getMessageList = useCallback(
    (
      messagesMap: Map<string, Pagination<Message[]>>,
      conversationId: string
    ) => {
      return messagesMap.get(conversationId) ?? initPaginatedMessages;
    },
    []
  );

  const appendMessage = useCallback(
    (message: Message) => {
      if (state.conversationId == null) {
        return;
      }
      const conversationId = state.conversationId;
      const messageList = getMessageList(state.messagesMap, conversationId);

      setState(({ messagesMap, ...remaining }) => {
        const idx = messageList.data.findIndex((it) => it.id === message.id);
        let newMessages: Message[] = [...messageList.data];
        if (idx >= 0) {
          newMessages[idx] = { ...newMessages[idx], ...message };
        } else {
          newMessages = [message, ...messageList.data];
        }
        const updatedMessageList = {
          ...messageList,
          data: newMessages,
        };
        const updatedMessagesMap = new Map(messagesMap);
        updatedMessagesMap.set(conversationId, updatedMessageList);
        return {
          ...remaining,
          messagesMap: updatedMessagesMap,
        };
      });
    },
    [getMessageList, setState, state.conversationId, state.messagesMap]
  );

  const mergeMessages = useCallback(
    (messages1: Message[], messages2: Message[]): Message[] => {
      const mergedMap: Map<string, Message> = new Map();
      // add messages from messages1 to the map
      for (const message of messages1) {
        mergedMap.set(message.id, message);
      }

      // add messages from messages2 to the map, updating readAt if necessary
      for (const message of messages2) {
        const existingMessage = mergedMap.get(message.id);
        if (existingMessage) {
          existingMessage.readAt = existingMessage.readAt || message.readAt;
        } else {
          mergedMap.set(message.id, message);
        }
      }

      // convert the map to an array to preserve the order
      return Array.from(mergedMap.values());
    },
    []
  );

  const checkNewMessages = useCallback(
    (localMessages: Message[], messageListResponse: MessageListResponse) => {
      if (localMessages.length < messageListResponse.messages.count) {
        return true;
      }
      if (messageListResponse.messages.results.length === 0) {
        return false;
      }
      if (localMessages.length === 0) {
        return true;
      }
      const firstLocalMessage = localMessages[0];
      const firsttRemoteMessage = messageListResponse.messages.results[0];
      return firstLocalMessage.id !== firsttRemoteMessage.id;
    },
    []
  );

  /*
  The function will only called when `notify_read_all` WebSocket message received.

  WebSocket is designed for real-time messaging and is not the best approach for bulk operations.
  Thus, we use HTTP to bulk update the `read_at` field for all previous messages with `read_at` set to null.

  However, this won't be responsive enough.
  
  To fix this, we send a WebSocket message, `notify_read_all`, to the server indicating that all messages have been marked as read when the client first connects to the WebSocket.
  After receiving the broadcast, we know that the other person in the conversation had read the message.
  And we can update the UI accordingly.
  */
  const markAllMessagesAsRead = useCallback(
    (senderId: string) => {
      if (!state.conversationId) {
        return;
      }
      const messageList = getMessageList(
        state.messagesMap,
        state.conversationId
      );

      const updatedMessageList = {
        ...messageList,
        data: messageList.data.reduce((acc, message) => {
          if (!message.readAt && senderId !== message.sender.id) {
            acc.push({
              ...message,
              readAt: new Date().toISOString(),
            });
          } else {
            acc.push(message);
          }
          return acc;
        }, [] as Message[]),
      };

      const updatedMessagesMap = new Map(state.messagesMap);
      updatedMessagesMap.set(state.conversationId, updatedMessageList);

      setState({
        ...state,
        messagesMap: updatedMessagesMap,
      });
    },
    [getMessageList, setState, state]
  );

  useEffect(() => {
    if (lastJsonMessage != null && user != null) {
      (async () => {
        try {
          if (
            "notify_read_all" in lastJsonMessage &&
            "sender_id" in lastJsonMessage
          ) {
            const senderId = `${lastJsonMessage.sender_id}`;
            markAllMessagesAsRead(senderId);
            return;
          }

          const message = await MessageSchema.validate(lastJsonMessage);
          appendMessage(message);

          // Note(ihsuanl): update the read_at field in real-time for new messages
          if (message.readAt == null && user.id !== message.sender.id) {
            const payload: MessageReadRequestPayload = {
              action: MessageRequestType.MarkAsRead,
              message_id: message.id,
            };
            sendMessage(JSON.stringify(payload));
          }
        } catch (e) {
          handleError(e);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage, user]);

  const fetch = useCallback(
    async ({
      page = 1,
      conversationId,
      isLoadingMore = false,
    }: {
      page?: number;
      conversationId: string;
      isLoadingMore?: boolean;
    }) => {
      const response = await apiClient.getMessages(conversationId, { page });
      const messageList = getMessageList(state.messagesMap, conversationId);

      hasNewMessageRef.current = checkNewMessages(messageList.data, response);

      let mergedMessages = [];
      if (isLoadingMore) {
        mergedMessages = mergeMessages(
          messageList.data,
          response.messages.results || []
        );
      } else {
        mergedMessages = mergeMessages(
          response.messages.results || [],
          messageList.data
        );
      }

      const updatedMessageList = makePagination(
        mergedMessages,
        response.messages.next,
        response.messages.count
      );
      const updatedMessagesMap = new Map(state.messagesMap).set(
        conversationId,
        updatedMessageList
      );

      setState((prevState) => ({
        ...prevState,
        messagesMap: updatedMessagesMap,
      }));
    },
    [
      apiClient,
      checkNewMessages,
      getMessageList,
      mergeMessages,
      setState,
      state.messagesMap,
    ]
  );

  const getMessagesUntil = useCallback(
    async function* (
      conversationId: string,
      desiredMessageId: string
    ): AsyncGenerator<string> {
      const { next, data, count } = getMessageList(
        state.messagesMap,
        conversationId
      );
      let nextPage = next;
      let messages = data;
      while (nextPage > -1) {
        const response = await apiClient.getMessages(conversationId, {
          page: nextPage,
          message_id: desiredMessageId,
        });

        messages = mergeMessages(messages, response.messages.results || []);

        for (const message of messages) {
          yield message.id;
          if (message.id === desiredMessageId) {
            break;
          }
        }

        const { next: updatedNext } = makePagination(
          messages,
          response.messages.next,
          response.messages.count
        );
        nextPage = updatedNext;
      }

      // Note(ihsuanl): do the calculation of the current page and total pages for continuing the pagination
      const totalPages = Math.ceil(count / PAGE_SIZE);
      const currentPage = Math.floor(
        (data.length + messages.length) / PAGE_SIZE
      );

      const updatedMessagesMap = new Map(state.messagesMap).set(
        conversationId,
        makePagination(
          messages,
          currentPage < totalPages ? currentPage : -1,
          count
        )
      );

      setState((prevState) => ({
        ...prevState,
        messagesMap: updatedMessagesMap,
      }));
    },
    [getMessageList, state.messagesMap, setState, apiClient, mergeMessages]
  );

  return useMemo(
    () => ({
      [ConversationViewActionType.Init]: async (conversationId: string) => {
        try {
          const resp = await apiClient.getAuthToken();
          setWebsocketState({
            url:
              REACT_APP_CHIRP_WS_ENDPOINT +
              `/ws/conversation/${conversationId}?${stringifyQueryParams({
                auth_token: resp.authToken,
              })}`,
          });

          // update current conversationId
          setState(({ ...remaining }) => {
            return {
              ...remaining,
              conversationId,
            };
          });

          // fetch initial messages
          await fetch({
            conversationId,
          });
        } catch (e) {
          handleError(e);
        }

        // we don't wait for the response, neither do we handle errors from it.
        apiClient.markMessagesAsRead(conversationId).then(() => {
          const payload: MessageNotifyReadAllRequestPayload = {
            action: MessageRequestType.NotifyReadAll,
          };
          sendMessage(JSON.stringify(payload));
        });
      },
      [ConversationViewActionType.SendMessage]: (
        payload: MessageRequestPayload
      ) => {
        sendMessage(JSON.stringify(payload));
      },
      [ConversationViewActionType.LoadMoreMessage]: async (
        conversationId: string
      ) => {
        if (!hasNewMessageRef.current) {
          // directly return if there is no new messages
          return;
        }
        try {
          const messageList = getMessageList(state.messagesMap, conversationId);
          await fetch({
            page: messageList.next,
            conversationId: conversationId,
            isLoadingMore: true,
          });
        } catch (e) {
          handleError(e);
        }
      },
      [ConversationViewActionType.LoadUntilMessage]: async (
        conversationId: string,
        messageId: string
      ) => {
        try {
          const messagesUntilTarget = getMessagesUntil(
            conversationId,
            messageId
          );

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for await (const _ of messagesUntilTarget) {
            // does nothing
          }
        } catch (e) {
          handleError(e);
        }
      },
    }),
    [
      apiClient,
      fetch,
      getMessageList,
      getMessagesUntil,
      sendMessage,
      setState,
      state.messagesMap,
      handleError,
    ]
  );
};

type ConversationViewActions = ReturnType<typeof useMakeActions>;
interface ConversationViewContextValue {
  state: ConversationViewState;
  actions: ConversationViewActions;
}

export const ConversationViewContext =
  React.createContext<ConversationViewContextValue>(null as any);

type Props = React.PropsWithChildren;
export const ConversationViewContextProvider: React.FC<Props> = (props) => {
  const [state, setState] = useState<ConversationViewState>(initState);
  const actions = useMakeActions(state, setState);

  const contextValue = useMemo<ConversationViewContextValue>(
    () => ({
      state,
      actions,
    }),
    [actions, state]
  );

  return (
    <ConversationViewContext.Provider value={contextValue}>
      {props.children}
    </ConversationViewContext.Provider>
  );
};
