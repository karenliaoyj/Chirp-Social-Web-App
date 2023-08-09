import {
  ConversationAPIClient,
  makeConversationAPIClient,
} from "./conversation";
import { ChannelAPIClient, makeChannelAPIClient } from "./channel";
import { makeUserAPIClient, UserAPIClient } from "./user";
import { makePostAPIClient, PostAPIClient } from "./post";

export type APIClient = UserAPIClient &
  ConversationAPIClient &
  ChannelAPIClient &
  PostAPIClient;

const makeAPIClient = (): APIClient => ({
  ...makeUserAPIClient(),
  ...makeChannelAPIClient(),
  ...makeConversationAPIClient(),
  ...makePostAPIClient(),
});

export default makeAPIClient;
