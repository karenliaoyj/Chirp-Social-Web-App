import React, { useCallback, useEffect, useRef, useState } from "react";
import Modal from "../../../components/Modal/Modal";
import { useUser } from "../../../contexts/UserContextProvider";

import "./SearchMessageModal.scss";
import { Message } from "../../../models/message";
import { useAPIContext } from "../../../contexts/APIContextProvider";
import { Conversation } from "../../../models/conversation";
import { Pagination, makePagination } from "../../../models/pagination";
import { initPaginatedMessages } from "../ConversationView/ConversationViewContextProvider";
import InputField from "../../../components/InputField/InputField";
import useDebounce from "../../../hooks/useDebounce";
import SearchMessageItem from "../../../components/SearchMessageItem/SearchMessageItem";
import { useErrorContext } from "../../../contexts/ErrorContextProvider";

interface Props {
  conversation: Conversation;
  isOpen: boolean;
  onRequestClose: () => void;
  onItemClicked: (message: Message) => void;
}
const SearchMessageModal: React.FC<Props> = (props) => {
  const { conversation, isOpen, onRequestClose, onItemClicked } = props;
  const { apiClient } = useAPIContext();
  const { handleError } = useErrorContext();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [messages, setMessages] = useState<Pagination<Message[]>>(
    initPaginatedMessages
  );
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useUser();
  if (user == null) {
    throw new Error("Unexpected user not found in the Home Page");
  }

  const debouncedSearchTerm = useDebounce(searchTerm);
  const searchListRef = useRef<HTMLDivElement>(null);

  // Note(ihsuanl): reset the search text
  useEffect(() => {
    setSearchTerm("");
  }, [conversation]);

  const fetch = useCallback(
    async ({
      page = 1,
      searchTerm = "",
    }: {
      page?: number;
      searchTerm?: string;
    }) => {
      if (searchTerm === "") {
        return;
      }
      try {
        const response = await apiClient.getMessages(conversation.id, {
          page,
          search_term: searchTerm,
        });
        let _messages: Message[];
        if (page === 1) {
          _messages = [...response.messages.results];
        } else {
          _messages = [...messages.data, ...response.messages.results];
        }
        setTotalCount(response.messages.count);
        setMessages(
          makePagination(
            _messages,
            response.messages.next,
            response.messages.count
          )
        );
      } catch (e) {
        handleError(e);
      }
    },
    [apiClient, conversation.id, messages.data, handleError]
  );

  useEffect(() => {
    (async () => {
      await fetch({
        searchTerm: debouncedSearchTerm,
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, conversation]);

  const onScroll = useCallback(async () => {
    if (searchListRef.current) {
      const isScrolledToBottom =
        searchListRef.current.scrollTop + searchListRef.current.clientHeight >=
        searchListRef.current.scrollHeight;
      if (isScrolledToBottom && messages.next > -1) {
        await fetch({
          page: messages.next,
          searchTerm: debouncedSearchTerm,
        });
      }
    }
  }, [debouncedSearchTerm, fetch, messages.next]);

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div className="search-message-modal">
        <div className="search-message-modal__cancel" onClick={onRequestClose}>
          <i className="search-message-modal__cancel-icon"></i>
        </div>
        <div className="search-message-modal__title">Search Messages</div>
        <div className="search-message-modal__content">
          Search the messages with
          <span className="search-message-modal__content__bold">
            {` ${conversation.receiver.firstName} ${conversation.receiver.lastName} (${conversation.receiver.username})`}
          </span>
          <br />
          <InputField
            name="search_term"
            inputType="text"
            label="Search for Messages"
            value={searchTerm}
            placeholder=""
            onInputStateChanged={(text) => {
              setSearchTerm(text);
            }}
          />
          {debouncedSearchTerm && messages.data.length > 0 ? (
            <div>
              <div className="search-message-modal-message-count">
                {`Messages: ${totalCount}`}
              </div>
              <div
                ref={searchListRef}
                className="search-message-modal-wrapper"
                onScroll={onScroll}
              >
                {messages.data.map((it) => {
                  return (
                    <SearchMessageItem
                      key={it.id}
                      message={it}
                      searchTerm={debouncedSearchTerm}
                      onItemClicked={onItemClicked}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="search-message-modal-empty-view">
              <i className="search-message-modal-empty-icon"></i> No Result
              Found.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SearchMessageModal;
