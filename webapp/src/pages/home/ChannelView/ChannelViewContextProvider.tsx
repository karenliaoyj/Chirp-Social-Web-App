import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import useWebSocket from "react-use-websocket";
import { PostSchema } from "../../../apiClient/schemas/post";
import { useAPIContext } from "../../../contexts/APIContextProvider";
import { Post } from "../../../models/post";
import { PostRequestPayload } from "../../../models/request";
import { stringifyQueryParams } from "../../../utils/request";
import { Nullable } from "../../../utils/types";
import { CommentSchema } from "../../../apiClient/schemas/comment";
import { Comment } from "../../../models/comment";
import { useErrorContext } from "../../../contexts/ErrorContextProvider";
import { REACT_APP_CHIRP_WS_ENDPOINT } from "../../../config";

interface ChannelViewState {
  channelId: string;
  postMap: Map<string, Post[]>;
}

const initState: ChannelViewState = {
  channelId: "",
  postMap: new Map<string, Post[]>(),
};

export enum ChannelViewActionType {
  Init = "init",
  PostContent = "postContent",
}

interface WebSocketState {
  url: Nullable<string>;
}

const useMakeActions = (
  state: ChannelViewState,
  setState: Dispatch<SetStateAction<ChannelViewState>>
) => {
  const { apiClient } = useAPIContext();
  const { handleError } = useErrorContext();
  const [websocketState, setWebsocketState] = useState<WebSocketState>({
    url: null,
  });
  const { sendMessage, lastJsonMessage } = useWebSocket<{
    [key in string]: any;
  }>(websocketState.url);

  const getPostList = useCallback(
    (postMap: Map<string, Post[]>, channelId: string) => {
      return postMap.get(channelId) || [];
    },
    []
  );

  const appendPost = useCallback(
    (post: Post) => {
      const channelId = state.channelId;
      setState(({ postMap, ...remaining }) => {
        const postList = getPostList(postMap, channelId);
        const updatedPostList = [...postList, post];
        const updatedPostMap = new Map(postMap);
        updatedPostMap.set(channelId, updatedPostList);
        return {
          ...remaining,
          postMap: updatedPostMap,
        };
      });
    },
    [getPostList, setState, state.channelId]
  );

  const appendComment = useCallback(
    (comment: Comment, postId: string) => {
      setState((prevState) => {
        const postList = prevState.postMap.get(prevState.channelId) || [];
        const postIndex = postList.findIndex((post) => post.id === postId);
        if (postIndex < 0) {
          console.warn(`Post with ID ${postId} not found`);
          return prevState;
        }
        const post = postList[postIndex];
        const commentList = post.comments || [];
        const updatedCommentList: Comment[] = [...commentList, comment];
        const updatedPostList = [...postList];
        updatedPostList[postIndex] = {
          ...post,
          comments: updatedCommentList,
        };
        const updatedPostMap = new Map(prevState.postMap);
        updatedPostMap.set(prevState.channelId, updatedPostList);
        return {
          ...prevState,
          postMap: updatedPostMap,
        };
      });
    },
    [setState]
  );

  //check lastJsonMessage, if is post=> use PostSchema to validate, else=> use CommentSchema validate
  //lastJsonMessage has comments key or not
  useEffect(() => {
    if (lastJsonMessage !== null) {
      (async () => {
        try {
          if ("comments" in lastJsonMessage) {
            const post = await PostSchema.validate(lastJsonMessage);
            appendPost(post);
          } else {
            const comment = await CommentSchema.validate(lastJsonMessage);
            const postId = `${lastJsonMessage.post_id}`;
            appendComment(comment, postId);
          }
        } catch (e) {
          handleError(e);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  const fetch = useCallback(
    async ({ channelId }: { channelId: string }) => {
      try {
        const response = await apiClient.getPosts(channelId);
        const updatedPostsMap = new Map(state.postMap).set(
          channelId,
          response.posts
        );
        setState((prevState) => ({
          ...prevState,
          postMap: updatedPostsMap,
        }));
      } catch (e) {
        handleError(e);
      }
    },
    [apiClient, setState, state.postMap, handleError]
  );

  return useMemo(
    () => ({
      [ChannelViewActionType.Init]: async (channelId: string) => {
        try {
          const resp = await apiClient.getAuthToken();
          setWebsocketState({
            url:
              REACT_APP_CHIRP_WS_ENDPOINT +
              `/ws/channels/${channelId}?${stringifyQueryParams({
                auth_token: resp.authToken,
              })}`,
          });

          // update current channelId
          setState(({ ...remaining }) => {
            return {
              ...remaining,
              channelId,
            };
          });

          await fetch({
            channelId,
          });
        } catch (e) {
          handleError(e);
        }
      },
      [ChannelViewActionType.PostContent]: (payload: PostRequestPayload) => {
        sendMessage(JSON.stringify(payload));
      },
    }),
    [apiClient, fetch, handleError, sendMessage, setState]
  );
};

type ChannelViewActions = ReturnType<typeof useMakeActions>;
interface ChannelViewContextValue {
  state: ChannelViewState;
  actions: ChannelViewActions;
}

export const ChannelViewContext = React.createContext<ChannelViewContextValue>(
  null as any
);

type Props = React.PropsWithChildren;

export const ChannelViewContextProvider: React.FC<Props> = (props) => {
  const [state, setState] = useState<ChannelViewState>(initState);
  const actions = useMakeActions(state, setState);

  const contextValue = useMemo<ChannelViewContextValue>(
    () => ({
      state,
      actions,
    }),
    [actions, state]
  );

  return (
    <ChannelViewContext.Provider value={contextValue}>
      {props.children}
    </ChannelViewContext.Provider>
  );
};
