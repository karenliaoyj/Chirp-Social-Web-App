import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Conversation } from "../models/conversation";
import { User } from "../models/user";
import { useAPIContext } from "./APIContextProvider";
import { useUser } from "./UserContextProvider";

interface ConversationMenuListState {
  conversations: Conversation[];
  newConversationUsers: User[];
}

const initState: ConversationMenuListState = {
  conversations: [],
  newConversationUsers: [],
};

export enum ConversationMenuListActionType {
  CreateConversation = "createConversation",
  GetConversations = "getConversations",
  GetNewConversationUsers = "getNewConversationUsers",
  UpdateLocalUnreadCount = "updateLocalUnreadCount",
}

const useMakeActions = (
  _state: ConversationMenuListState,
  setState: Dispatch<SetStateAction<ConversationMenuListState>>
) => {
  const {
    apiClient: { createConversation, getConversations, getUsers },
  } = useAPIContext();
  const { user } = useUser();

  return useMemo(
    () => ({
      [ConversationMenuListActionType.CreateConversation]: async (
        receiverId: string
      ) => {
        const resp = await createConversation(receiverId);
        setState(({ conversations, newConversationUsers }) => ({
          conversations: [...conversations, resp.conversation],
          newConversationUsers: newConversationUsers.filter(
            (it) => it.id != receiverId
          ),
        }));
      },
      [ConversationMenuListActionType.GetConversations]: async () => {
        const resp = await getConversations();
        setState(({ newConversationUsers }) => ({
          conversations: [...resp.conversations],
          newConversationUsers: newConversationUsers,
        }));
      },
      [ConversationMenuListActionType.GetNewConversationUsers]: async () => {
        const response = await getUsers({
          is_new_conversation: "true",
        });
        const remoteUsers = response.users.filter((it) => user?.id != it.id);
        setState(({ conversations }) => ({
          conversations: conversations,
          newConversationUsers: [...remoteUsers],
        }));
        return remoteUsers.length > 0 ? remoteUsers[0] : null;
      },
      [ConversationMenuListActionType.UpdateLocalUnreadCount]: (
        conversation: Conversation
      ) => {
        setState((prevState) => {
          const updatedConversations = prevState.conversations.map((it) => {
            if (it.id === conversation.id) {
              return {
                ...conversation,
                unreadCount: 0,
              };
            }
            return it;
          });

          return {
            ...prevState,
            conversations: updatedConversations,
          };
        });
      },
    }),
    [createConversation, getConversations, getUsers, setState, user?.id]
  );
};

type ConversationMenuListActions = ReturnType<typeof useMakeActions>;
interface ConversationMenuListContextValue {
  state: ConversationMenuListState;
  actions: ConversationMenuListActions;
}

export const ConversationMenuListContext =
  React.createContext<ConversationMenuListContextValue>(null as any);

type Props = React.PropsWithChildren;
export const ConversationMenuListProvider: React.FC<Props> = (props) => {
  const [state, setState] = useState<ConversationMenuListState>(initState);
  const actions = useMakeActions(state, setState);

  const contextValue = useMemo<ConversationMenuListContextValue>(
    () => ({
      state,
      actions,
    }),
    [actions, state]
  );

  return (
    <ConversationMenuListContext.Provider value={contextValue}>
      {props.children}
    </ConversationMenuListContext.Provider>
  );
};
