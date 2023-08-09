import React, { useCallback, useContext, useEffect, useState } from "react";
import DropdownField from "../../../components/DropdownField/DropdownField";
import { convertUsersToDropdownItems } from "../../../components/DropdownField/types";
import Modal from "../../../components/Modal/Modal";
import { ConversationMenuListContext } from "../../../contexts/ConversationMenuListProvider";
import { useUser } from "../../../contexts/UserContextProvider";
import { CreateConversationFormState } from "../../../models/conversation";
import { User } from "../../../models/user";

import "./CreateConversationModal.scss";

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
  onCreate: (createConversationState: CreateConversationFormState) => void;
}
const CreateConversationModal: React.FC<Props> = (props) => {
  const { isOpen, onRequestClose, onCreate } = props;
  const [createConversationState, setCreateConversationState] =
    useState<CreateConversationFormState>({
      receiver: null,
    });
  const {
    state: { newConversationUsers },
    actions: { getNewConversationUsers },
  } = useContext(ConversationMenuListContext);
  const { user } = useUser();
  if (user == null) {
    throw new Error("Unexpected user not found in the Home Page");
  }

  useEffect(() => {
    (async () => {
      const defaultUser = await getNewConversationUsers();
      setCreateConversationState((state: CreateConversationFormState) => ({
        ...state,
        receiver: defaultUser,
      }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreateConversationInputChange = useCallback(
    (
      key: keyof CreateConversationFormState,
      data: CreateConversationFormState[keyof CreateConversationFormState]
    ) => {
      setCreateConversationState((state: CreateConversationFormState) => ({
        ...state,
        [key]: data,
      }));
    },
    [setCreateConversationState]
  );

  const onConversationCreate = useCallback(() => {
    onCreate(createConversationState);
    setCreateConversationState({ receiver: null });
  }, [createConversationState, onCreate]);

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div className="base-modal">
        <div className="base-modal__cancel" onClick={onRequestClose}>
          <i className="base-modal__cancel-icon"></i>
        </div>
        <div className="base-modal__title">Create New Conversation</div>
        <div className="base-modal__content">
          Initiate a direct message with other users.
          <br />
          <DropdownField<User>
            initialIndex={0}
            title="Receiver"
            label="Receiver"
            options={convertUsersToDropdownItems(newConversationUsers)}
            onInputStateSelected={(_receiver) => {
              onCreateConversationInputChange("receiver", _receiver.value);
            }}
          />
        </div>
        <div className="base-modal__submit-button">
          <button
            className="button__primary"
            onClick={onConversationCreate}
            disabled={createConversationState.receiver == null}
          >
            Create
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateConversationModal;
