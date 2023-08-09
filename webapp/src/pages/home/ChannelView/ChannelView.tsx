import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import PostItem from "../../../components/PostList/PostItem";
import { Channel } from "../../../models/channel";
import { Post } from "../../../models/post";
import MainActionView, {
  MainActionState,
} from "../../../components/MainActionView/MainActionView";

import "./ChannelView.scss";
import { PostRequestType } from "../../../models/request";
import { ChannelViewContext } from "./ChannelViewContextProvider";
import { ChannelMenuListContext } from "../../../contexts/ChannelMenuListProvider";
import ChannelUsersModal from "../ChannelUsersModal/ChannelUsersModal";

interface Props {
  channel: Channel;
  toggleThread: (post: Post) => void;
}

const ChannelView: React.FC<Props> = (props) => {
  const { channel, toggleThread } = props;
  const {
    state: { postMap },
    actions: { init, postContent },
  } = useContext(ChannelViewContext);
  const {
    actions: { leaveChannel },
  } = useContext(ChannelMenuListContext);
  const [isChannelUsersModalOpen, setIsChannelUsersModalOpen] = useState(false);

  const postListRef = useRef<HTMLDivElement>(null);
  const hasNewPostRef = useRef(false);

  const posts = useMemo(() => {
    return postMap.get(channel.id) || [];
  }, [channel.id, postMap]);

  useEffect(() => {
    if (postListRef.current) {
      if (hasNewPostRef && hasNewPostRef.current) {
        postListRef.current.scrollTop = postListRef.current.scrollHeight;
        hasNewPostRef.current = false;
      }
    }
  }, [posts]);

  const onThreadButtonClicked = useCallback(
    (post: Post) => {
      toggleThread(post);
    },
    [toggleThread]
  );

  const onSubmit = useCallback(
    (state: MainActionState) => {
      if (state.textareaStr != "") {
        hasNewPostRef.current = true;
        postContent({
          action: PostRequestType.Create,
          content: state.textareaStr.trim(),
        });
      }
    },
    [postContent]
  );

  //call the init action
  useEffect(() => {
    (async () => {
      try {
        await init(channel.id);
      } finally {
        hasNewPostRef.current = true;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.id]);

  const onLeaveButtonClicked = useCallback(async () => {
    try {
      await leaveChannel(channel.id);
    } catch (e: any) {
      console.log(e);
    }
  }, [leaveChannel, channel.id]);

  const openChannelUsersModal = useCallback(() => {
    setIsChannelUsersModalOpen(true);
  }, []);

  const closeChannelUsersModal = useCallback(() => {
    setIsChannelUsersModalOpen(false);
  }, []);

  return (
    <>
      <div className="channel-container">
        <div className="channel-header">
          <div className="channel-title">
            <p className="channel-name">{channel.name}</p>
            <button
              className="channel-user-button"
              onClick={openChannelUsersModal}
            >
              {" " + channel.users.length}
            </button>
          </div>
          {channel.name != "General" && (
            <button className="channel-leave" onClick={onLeaveButtonClicked}>
              {"Leave "}
              <i className="channel-leave-icon"></i>
            </button>
          )}
        </div>
        <div className="channel-content">
          {posts.map((it) => {
            return (
              <PostItem
                key={`post-${it.id}`}
                type={"post"}
                post={it}
                onThreadButtonClicked={onThreadButtonClicked}
              />
            );
          })}
        </div>
        <MainActionView onSubmit={onSubmit} />
      </div>
      <ChannelUsersModal
        users={channel.users}
        isOpen={isChannelUsersModalOpen}
        onRequestClose={closeChannelUsersModal}
      />
    </>
  );
};

export default ChannelView;
