import React, { useCallback } from "react";
import { Message } from "../../models/message";

import "./SearchMessageItem.scss";

interface Props {
  message: Message;
  searchTerm: string;
  onItemClicked: (message: Message) => void;
}
const SearchMessageItem: React.FC<Props> = (props) => {
  const { message, searchTerm, onItemClicked } = props;

  const highlightedContent = message.content.replace(
    new RegExp(`(${searchTerm})`, "gi"),
    '<span style="font-weight: bold; color: #0057ff;">$1</span>'
  );

  const onClick = useCallback(() => {
    onItemClicked(message);
  }, [message, onItemClicked]);

  return (
    <div className={"search-message-item-container"} onClick={onClick}>
      <div className={"search-message-item-title"}>
        <p className={"search-message-item-meta"}>
          {message.sender.username}
          <span className={"search-message-item-time"}>
            {message.createdAt}
          </span>
        </p>
      </div>
      <p
        className="search-message-item-content"
        dangerouslySetInnerHTML={{ __html: highlightedContent }}
      ></p>
    </div>
  );
};

export default SearchMessageItem;
