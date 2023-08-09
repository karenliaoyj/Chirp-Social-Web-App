import * as yup from "yup";
import { Message, PaginatedMessageList } from "../../models/message";
import { UserSchema } from "./user";
import { MessageListResponse } from "../../models/response";

export const MessageSchema: yup.Schema<Message> = yup
  .object<Message>({
    id: yup.string().required(),
    sender: UserSchema,
    createdAt: yup.string().required(),
    content: yup.string().required(),
    readAt: yup.string().defined().default(null).nullable(),
  })
  .required()
  .camelCase();

export const PaginatedMessageListSchema: yup.Schema<PaginatedMessageList> = yup
  .object<PaginatedMessageList>({
    count: yup.number().required(),
    next: yup.string().defined().nullable(),
    previous: yup.string().defined().nullable(),
    results: yup.array().defined().of(MessageSchema),
  })
  .required()
  .camelCase();

export const MessageListResponseSchema: yup.Schema<MessageListResponse> = yup
  .object<MessageListResponse>({
    messages: PaginatedMessageListSchema,
  })
  .required()
  .camelCase();
