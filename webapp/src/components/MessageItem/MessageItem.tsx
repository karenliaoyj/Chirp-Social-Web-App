import React, { useImperativeHandle, useRef } from "react";
import { Message } from "../../models/message";
import { useUser } from "../../contexts/UserContextProvider";

interface Props {
  message: Message;
}

export interface MessageItemElement {
  navigate: () => void;
}

const MessageItem = React.forwardRef<MessageItemElement, Props>(
  function MessageItem(props, ref) {
    const { user } = useUser();
    if (user == null) {
      throw new Error("Unexpected user not found");
    }

    const { message } = props;
    const messageRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      navigate: () => {
        const element = messageRef.current;
        if (element) {
          element.classList.add("highlighted");
          element.scrollIntoView({ behavior: "auto" });
          setTimeout(() => {
            element.classList.remove("highlighted");
          }, 1000);
        }
      },
    }));

    return (
      <div className={"message-item-container"} ref={messageRef}>
        <div className={"message-item-title"}>
          <p
            className={
              user.id === message.sender.id
                ? "message-item-username-user"
                : "message-item-username-guest"
            }
          >
            {message.sender.username}
          </p>
          <div className="message-item-info">
            {user.id === message.sender.id && message.readAt != null && (
              <i className="message-item-read-icon">read</i>
            )}
            <p className={"message-item-time"}>{message.createdAt}</p>
          </div>
        </div>
        <p className="message-item-content">{message.content}</p>
      </div>
    );
  }
);

export default MessageItem;
