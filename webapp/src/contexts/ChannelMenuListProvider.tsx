import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Channel } from "../models/channel";
import { useAPIContext } from "./APIContextProvider";

interface ChannelMenuListState {
  channels: Channel[];
}

const initState: ChannelMenuListState = {
  channels: [],
};

export enum ChannelMenuListActionType {
  CreateChannel = "createChannel",
  GetChannels = "getChannels",
  GetPublicChannel = "getPublicChannel",
  JoinChannel = "joinChannel",
  LeaveChannel = "leaveChannel",
}

const useMakeActions = (
  _state: ChannelMenuListState,
  setState: Dispatch<SetStateAction<ChannelMenuListState>>
) => {
  const {
    apiClient: {
      createChannel,
      getChannels,
      getPublicChannels,
      joinChannel,
      leaveChannel,
    },
  } = useAPIContext();

  return useMemo(
    () => ({
      [ChannelMenuListActionType.CreateChannel]: async (
        name: string,
        description: string,
        type: string,
        memberId: string[]
      ) => {
        const resp = await createChannel(name, description, type, memberId);
        setState(({ channels }) => ({
          channels: [...channels, resp.channel],
        }));
      },
      [ChannelMenuListActionType.GetChannels]: async () => {
        const resp = await getChannels();
        setState(() => ({
          channels: [...resp.channels],
        }));
      },
      [ChannelMenuListActionType.GetPublicChannel]: async (title: string) => {
        getPublicChannels({
          search_term: title,
        });
      },
      [ChannelMenuListActionType.JoinChannel]: async (id: string) => {
        const resp = await joinChannel(id);
        setState(({ channels }) => ({
          channels: [...channels, resp.channel],
        }));
      },
      [ChannelMenuListActionType.LeaveChannel]: async (id: string) => {
        await leaveChannel(id);
        const resp = await getChannels();
        setState(() => ({
          channels: [...resp.channels],
        }));
      },
    }),
    [
      createChannel,
      getChannels,
      getPublicChannels,
      joinChannel,
      leaveChannel,
      setState,
    ]
  );
};

type ChannelMenuListActions = ReturnType<typeof useMakeActions>;
interface ChannelMenuListContextValue {
  state: ChannelMenuListState;
  actions: ChannelMenuListActions;
}

export const ChannelMenuListContext =
  React.createContext<ChannelMenuListContextValue>(null as any);

type Props = React.PropsWithChildren;
export const ChannelMenuListProvider: React.FC<Props> = (props) => {
  const [state, setState] = useState<ChannelMenuListState>(initState);
  const actions = useMakeActions(state, setState);

  const contextValue = useMemo<ChannelMenuListContextValue>(
    () => ({
      state,
      actions,
    }),
    [actions, state]
  );

  return (
    <ChannelMenuListContext.Provider value={contextValue}>
      {props.children}
    </ChannelMenuListContext.Provider>
  );
};
