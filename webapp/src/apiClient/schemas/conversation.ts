import * as yup from "yup";
import {
  ConversationListResponse,
  ConversationResponse,
} from "../../models/response";
import { Conversation, ConversationType } from "../../models/conversation";
import { UserSchema } from "./user";

export const ConverstaionSchema: yup.Schema<Conversation> = yup
  .object<Conversation>({
    id: yup.string().required(),
    users: yup.array(UserSchema).required(),
    receiver: UserSchema,
    createdAt: yup.string().required(),
    unreadCount: yup.number().required(),
    type: yup
      .mixed()
      .oneOf([ConversationType.DirectMessage, ConversationType.Create])
      .required(),
  })
  .required()
  .camelCase();

export const ConversationResponseSchema: yup.Schema<ConversationResponse> = yup
  .object<ConversationResponse>({
    conversation: ConverstaionSchema,
  })
  .required()
  .camelCase();

export const ConversationListResponseSchema: yup.Schema<ConversationListResponse> =
  yup
    .object<ConversationListResponse>({
      conversations: yup.array().defined().of(ConverstaionSchema),
    })
    .required()
    .camelCase();
