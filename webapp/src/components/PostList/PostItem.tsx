import React, { useCallback, useMemo } from "react";
import { Post } from "../../models/post";

import "./PostItem.scss";

type Props = {
  type: "post" | "thread";
  post: Post;
  onThreadButtonClicked?: (post: Post) => void;
};

const PostItem: React.FC<Props> = (props) => {
  const { post, onThreadButtonClicked } = props;

  const _onThreadButtonClicked = useCallback(() => {
    if (onThreadButtonClicked) {
      onThreadButtonClicked(post);
    }
  }, [onThreadButtonClicked, post]);

  const commentCountStr = useMemo(() => {
    const count = post.comments.length;
    return count > 0 ? ` (${count})` : "";
  }, [post.comments.length]);

  return (
    <div
      className={`${
        props.type === "thread" ? "thread-container" : "post-container"
      }`}
    >
      <div className="user-info">
        <p className={`meta ${props.type === "thread" ? "thread-meta" : ""}`}>
          {post.user.username}
          <span
            className={`${
              props.type === "thread" ? "thread-time" : "post-time"
            }`}
          >
            {post.createdAt}
          </span>
        </p>
      </div>
      <p className="content">{post.content}</p>
      {onThreadButtonClicked && (
        <div className="comment-container">
          <button
            onClick={_onThreadButtonClicked}
          >{`Reply${commentCountStr}`}</button>
        </div>
      )}
    </div>
  );
};

export default PostItem;
