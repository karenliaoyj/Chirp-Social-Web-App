import React, { useCallback, useContext, useEffect, useRef } from "react";
import { SecondaryContent, SecondaryContentType } from "../../pages/home/types";
import { Nullable } from "../../utils/types";
import PostItem from "../PostList/PostItem";
import MainActionView, {
  MainActionState,
} from "../../components/MainActionView/MainActionView";
import { PostRequestPayload, PostRequestType } from "../../models/request";
import { ChannelViewContext } from "../../pages/home/ChannelView/ChannelViewContextProvider";
import "./ContentView.scss";

type Props = {
  secondaryContent: Nullable<SecondaryContent>;
  onSecondaryContentDismissed: (content: SecondaryContent) => void;
} & React.PropsWithChildren;

const ContentView: React.FC<Props> = (props) => {
  const { children, secondaryContent, onSecondaryContentDismissed } = props;
  const {
    actions: { postContent },
  } = useContext(ChannelViewContext);

  const commentListRef = useRef<HTMLDivElement>(null);
  const hasNewCommentRef = useRef(false);

  useEffect(() => {
    if (commentListRef.current) {
      if (hasNewCommentRef && hasNewCommentRef.current) {
        commentListRef.current.scrollTop = commentListRef.current.scrollHeight;
        hasNewCommentRef.current = false;
      }
    }
  }, [secondaryContent?.post.comments]);

  const dismissSecondaryContent = useCallback(() => {
    if (secondaryContent) {
      onSecondaryContentDismissed(secondaryContent);
    }
  }, [secondaryContent, onSecondaryContentDismissed]);

  const onSubmit = useCallback(
    (state: MainActionState) => {
      if (state.textareaStr != "") {
        hasNewCommentRef.current = true;
        let payload: PostRequestPayload = {
          action: PostRequestType.Comment,
          content: state.textareaStr.trim(),
        };

        if (secondaryContent && secondaryContent.post != null) {
          payload = {
            ...payload,
            post_id: secondaryContent.post.id,
          };
        }
        postContent(payload);
      }
    },
    [postContent, secondaryContent]
  );

  const renderSecondaryContent = useCallback(() => {
    if (secondaryContent == null) {
      return;
    }

    switch (secondaryContent.type) {
      case SecondaryContentType.Thread:
        return (
          <div className="secondary-content" ref={commentListRef}>
            <div className="secondary-content-thread">
              <PostItem type={"thread"} post={secondaryContent.post} />
              {secondaryContent.post.comments.map((comment, index) => (
                <ul key={index} className="comment_in_thread">
                  <div className="comment-title">
                    <span className="comment-meta">
                      {comment.user.username}
                    </span>
                    <span className="thread-time">{comment.createdAt}</span>
                  </div>
                  <p className="content">{comment.content}</p>
                </ul>
              ))}
            </div>
            <MainActionView onSubmit={onSubmit} />
            <button onClick={dismissSecondaryContent}>
              <i className="secondary-content-xmark"></i>
            </button>
          </div>
        );
    }
  }, [dismissSecondaryContent, onSubmit, secondaryContent]);

  return (
    <div className="main-content-wrapper">
      <div className="main-content">{children}</div>
      {renderSecondaryContent()}
    </div>
  );
};

export default ContentView;
