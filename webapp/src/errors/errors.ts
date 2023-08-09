export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message || "Not Found");
    this.name = "Not Found Error";
    this.statusCode = 404;
  }
  statusCode: number;
}

export class Forbidden extends Error {
  constructor(message?: string) {
    super(message || "Forbidden");
    this.name = "Forbidden";
    this.statusCode = 403;
  }
  statusCode: number;
}

export class InternalServerError extends Error {
  constructor(message?: string) {
    super(message || "Internal Server Error");
    this.name = "Internal Server Error";
    this.statusCode = 500;
  }

  statusCode: number;
}

export class APIError extends Error {
  code: number;
  message: string;
  reason?: string;
  info?: any;

  constructor(
    code: number,
    message: string,
    reason?: string,
    info?: any,
    ...params: any[]
  ) {
    super(...params);

    this.name = "APIError";
    this.code = code;
    this.message = message;
    this.reason = reason;
    this.info = info;
  }
}

export enum APIErrorCode {
  // General Error
  NetworkUnavailableError = 1000,
  UnauthorizedError = 1001,
  UserUnauthorizedError = 1002,

  // User Error
  UserAlreadySignedUpError = 2001,
  UserRegistrationError = 2002,
  GetUsersError = 2003,
  UserEmailValidationError = 2004,

  // Channel Error
  ChannelAlreadyExistedError = 3001,
  ChannelCreationError = 3002,
  GetChannelsError = 3003,

  // Conversation Error
  ConversationCreationError = 4001,
  GetConversationsError = 4002,

  // Message Error
  GetMessagesError = 5001,

  // Post Error
  GetPostsError = 6001,
}

export function isAPIError(e: any): e is APIError {
  return e && e.message && e.code;
}

export function getAPIErrorTitleByErrorCode(code: number) {
  switch (code) {
    case 1000:
      return "Network Unavailable";
    case 1001:
      return "Unauthorized Error";
    case 1002:
      return "Login Error";
    case 2001:
      return "User Already Signed Up";
    case 2002:
      return "User Registration Error";
    case 2003:
      return "Get Users Error";
    case 2004:
      return "Email Validation Error";
    case 3001:
      return "Channel name already existed";
    case 3002:
      return "Channel Creation Error";
    case 3003:
      return "Get Channels Error";
    case 4001:
      return "Conversation Creation Error";
    case 4002:
      return "Get Conversations Error";
    case 5001:
      return "Get Messages Error";
    case 6001:
      return "Get Posts Error";
    default:
      return "Unexpected Error";
  }
}

export type StandardError = Forbidden | NotFoundError | InternalServerError;

export type ChirpError = APIError | StandardError;
