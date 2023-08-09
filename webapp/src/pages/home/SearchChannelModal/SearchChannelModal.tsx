import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import DropdownField from "../../../components/DropdownField/DropdownField";
import { convertChannelsToDropdownItems } from "../../../components/DropdownField/types";
import InputField from "../../../components/InputField/InputField";
import Modal from "../../../components/Modal/Modal";
import { useAPIContext } from "../../../contexts/APIContextProvider";
import { Channel, SearchChannelFormState } from "../../../models/channel";

import "./SearchChannelModal.scss";
import { useErrorContext } from "../../../contexts/ErrorContextProvider";

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
  onCreate: (searchChannelState: SearchChannelFormState) => void;
}
const SearchChannelModal: React.FC<Props> = (props) => {
  const { isOpen, onRequestClose, onCreate } = props;
  const [searchChannelState, setSearchChannelState] =
    useState<SearchChannelFormState>({
      channel: null,
    });
  const [keyboardstate, setKeyboardState] = useState("");
  const [fetchedChannels, setFetchedChannels] = useState<Channel[]>([]);
  const [selectedChannelDescription, setSelectedChannelDescription] =
    useState("");
  const { apiClient } = useAPIContext();
  const { handleError } = useErrorContext();

  useEffect(() => {
    if (isOpen) {
      (async () => {
        try {
          const response = await apiClient.getPublicChannels({
            search_term: "",
          });
          const remoteChannels = response.channels;
          setFetchedChannels(remoteChannels);
          if (remoteChannels.length > 0) {
            setSearchChannelState((state: SearchChannelFormState) => ({
              ...state,
              channel: remoteChannels[0],
            }));
            setSelectedChannelDescription(
              "Description: " + remoteChannels[0].description
            );
          }
        } catch (e) {
          handleError(e);
        }
      })();
    }
  }, [apiClient, handleError, isOpen]);

  const onSearchChannelInputChange = useCallback(
    (
      key: keyof SearchChannelFormState,
      data: SearchChannelFormState[keyof SearchChannelFormState]
    ) => {
      setSearchChannelState((state: SearchChannelFormState) => ({
        ...state,
        [key]: data,
      }));
      if (data) {
        setSelectedChannelDescription("Description: " + data.description);
      }
    },
    [setSearchChannelState]
  );

  const onChannelSearch = useCallback(() => {
    onCreate(searchChannelState);
    setKeyboardState("");
  }, [searchChannelState, onCreate]);

  const onKeyboardChange = (e: string) => {
    setKeyboardState(e);
    delayedQuery(e);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const delayedQuery = useCallback(
    _.debounce((q) => getChannelData(q), 500),
    []
  );

  const getChannelData = useCallback(
    async (term: string) => {
      try {
        const response = await apiClient.getPublicChannels({
          search_term: term,
        });
        const remoteChannels = response.channels;
        setFetchedChannels(remoteChannels);
        if (remoteChannels.length > 0) {
          setSearchChannelState((state: SearchChannelFormState) => ({
            ...state,
            channel: remoteChannels[0],
          }));
          setSelectedChannelDescription(
            "Description: " + remoteChannels[0].description
          );
        } else {
          setSelectedChannelDescription("");
        }
      } catch (e) {
        handleError(e);
      }
    },
    [apiClient, handleError]
  );

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div className="base-modal">
        <div className="base-modal__cancel" onClick={onRequestClose}>
          <i className="base-modal__cancel-icon"></i>
        </div>
        <div className="base-modal__title">Search Public Channel</div>
        <div className="base-modal__content">
          Search for existing public channel.
          <br />
          <InputField
            name="search_text"
            inputType="text"
            label="Search for Channel"
            value={keyboardstate}
            placeholder=""
            onInputStateChanged={(text) => {
              onKeyboardChange(text);
            }}
          />
          <DropdownField<Channel>
            initialIndex={0}
            title="Title"
            label="Search Result List"
            options={convertChannelsToDropdownItems(fetchedChannels)}
            onInputStateSelected={(_channel) => {
              onSearchChannelInputChange("channel", _channel.value);
            }}
          />
        </div>
        <div className="base-modal__description">
          <p>{selectedChannelDescription}</p>
        </div>
        <div className="base-modal__submit-button">
          <button
            className="button__primary"
            onClick={onChannelSearch}
            disabled={searchChannelState.channel == null}
          >
            JOIN
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SearchChannelModal;
