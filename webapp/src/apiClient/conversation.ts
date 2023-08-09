import {
  ConversationListResponse,
  ConversationResponse,
  MessageListResponse,
} from "../models/response";
import { makeRequest, RequestData } from "../utils/request";
import {
  ConversationListResponseSchema,
  ConversationResponseSchema,
} from "./schemas/conversation";
import { MessageListResponseSchema } from "./schemas/message";

export function makeConversationAPIClient() {
  async function createConversation(receiverId: string) {
    const requestData: RequestData = {
      method: "POST",
      payload: {
        receiver_id: receiverId,
      },
    };
    return makeRequest<ConversationResponse>(
      "/api/conversation",
      requestData,
      ConversationResponseSchema
    );
  }

  async function getConversations() {
    const requestData: RequestData = {
      method: "GET",
    };
    return makeRequest<ConversationListResponse>(
      "/api/conversations",
      requestData,
      ConversationListResponseSchema
    );
  }

  async function getMessages(
    conversationId: string,
    query?: { [key: string]: any }
  ) {
    const requestData: RequestData = {
      method: "GET",
      queryParams: {
        ...query,
      },
    };
    return makeRequest<MessageListResponse>(
      `/api/conversation/${conversationId}/messages`,
      requestData,
      MessageListResponseSchema
    );
  }

  async function markMessagesAsRead(conversationId: string) {
    const requestData: RequestData = {
      method: "POST",
    };
    return makeRequest<void>(
      `/api/conversation/${conversationId}/messages/mark-as-read`,
      requestData
    );
  }

  return {
    createConversation,
    getConversations,
    getMessages,
    markMessagesAsRead,
  };
}

export type ConversationAPIClient = ReturnType<
  typeof makeConversationAPIClient
>;
