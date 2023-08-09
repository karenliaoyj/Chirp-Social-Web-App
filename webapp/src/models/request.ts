export enum MessageRequestType {
  Create = "create",
  MarkAsRead = "mark_as_read",
  NotifyReadAll = "notify_read_all",
}

export interface MessageRequestPayload {
  action: MessageRequestType;
  message: string;
}

export interface MessageReadRequestPayload {
  action: MessageRequestType.MarkAsRead;
  message_id: string;
}

export interface MessageNotifyReadAllRequestPayload {
  action: MessageRequestType.NotifyReadAll;
}

export enum PostRequestType {
  Create = "create",
  Comment = "comment",
}

export interface PostRequestPayload {
  action: PostRequestType;
  content: string;
  post_id?: string;
}
