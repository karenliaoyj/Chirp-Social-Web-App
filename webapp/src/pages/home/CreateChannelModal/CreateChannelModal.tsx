import * as yup from "yup";
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import InputField from "../../../components/InputField/InputField";
import Modal from "../../../components/Modal/Modal";
import {
  ChannelCreateErrorState,
  ChannelCreateState,
  CreateChannelFormState,
} from "../../../models/channel";

import "./CreateChannelModal.scss";
import Multiselect from "multiselect-react-dropdown";
import { User } from "../../../models/user";
import { useAPIContext } from "../../../contexts/APIContextProvider";
import { useUser } from "../../../contexts/UserContextProvider";
import { ValidationRule, validateFields } from "../../../utils/inputValidation";

const validateRules: ValidationRule<
  CreateChannelFormState,
  ChannelCreateErrorState
>[] = [
  {
    inputKey: "name",
    errorKey: "nameError",
    schema: yup
      .string()
      .trim()
      .required("The field name is required")
      .max(99, "The length should be less than 100 characters"),
  },
  {
    inputKey: "description",
    errorKey: "descriptionError",
    schema: yup
      .string()
      .trim()
      .required("The field description is required")
      .max(99, "The length should be less than 100 characters"),
  },
];

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
  onCreate: (createChannelState: ChannelCreateState) => Promise<void>;
}

const CreateChannelModal: React.FC<Props> = (props) => {
  const { apiClient } = useAPIContext();
  const { user } = useUser();
  const { isOpen, onRequestClose, onCreate } = props;
  const [visible, setAddUserVisible] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<User[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [createChannelState, setCreateChannelState] =
    useState<ChannelCreateState>({
      name: "",
      description: "",
      type: "public",
      members: [],
    });
  const multiselectRef = useRef<Multiselect>(null);

  const convertUsersToDropdownItems = (users: User[]) => {
    return users.map((it) => ({
      key: `${it.username} (${it.firstName} ${it.lastName})`,
      value: it,
    }));
  };

  useEffect(() => {
    (async () => {
      const response = await apiClient.getUsers();
      const remoteUsers = response.users.filter((it) => user?.id != it.id);
      setRemoteUsers(remoteUsers);
    })();
  }, [apiClient, user?.id]);

  const validateFormField = useCallback(
    async (field: keyof ChannelCreateState) => {
      return validateFields([field], createChannelState, validateRules).then(
        ({ errorList }) => {
          setCreateChannelState((state) => ({
            ...state,
            ...errorList,
          }));
        }
      );
    },
    [createChannelState, setCreateChannelState]
  );

  const onSubmit = useCallback(async () => {
    validateFields(["name", "description"], createChannelState, validateRules)
      .then(({ isValid, errorList }) => {
        if (isValid) {
          onCreate(createChannelState).catch((e) => {
            setCreateChannelState((state) => ({
              ...state,
              emailErrorId: e.message,
            }));
          });
        } else {
          setCreateChannelState((state) => ({
            ...state,
            ...errorList,
          }));
        }
      })
      .catch((e) => console.error(e));
  }, [createChannelState, setCreateChannelState, onCreate]);

  const onInputChange = useCallback(
    (
      key: keyof ChannelCreateState,
      data: ChannelCreateState[keyof ChannelCreateState]
    ) => {
      setCreateChannelState((state: ChannelCreateState) => ({
        ...state,
        [key]: data,
      }));
    },
    [setCreateChannelState]
  );

  const onMemberSelect = useCallback(
    (selectedList: any, selectedUser: { key: string; value: User }) => {
      setCreateChannelState((state: ChannelCreateState) => ({
        ...state,
        members: [...state.members, selectedUser.value.id],
      }));
    },
    [setCreateChannelState]
  );

  const onMemberRemove = useCallback(() => {
    const members: string[] = [];
    multiselectRef.current?.getSelectedItems().forEach(function (object: any) {
      members.push(object.value.id);
    });
    setCreateChannelState((state: ChannelCreateState) => ({
      ...state,
      members: members,
    }));
  }, [setCreateChannelState]);

  const onChannelCreate = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      onSubmit();
      //onCreate(createChannelState);
      event.preventDefault();
      onInputChange("name", "");
      onInputChange("description", "");
      onInputChange("type", "public");
      setAddUserVisible(false);
    },
    [onInputChange, onSubmit]
  );

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div className="base-modal">
        <div className="base-modal__cancel" onClick={onRequestClose}>
          <i className="base-modal__cancel-icon"></i>
        </div>
        <div className="base-modal__title">Create New Channel</div>
        <div className="base-modal__content">
          Create a new channel to communicate with your team.
          <br />
          <br />
          <form
            className="base-modal__form"
            method="POST"
            onSubmit={onChannelCreate}
          >
            <InputField
              name="name"
              inputType="text"
              label="Name"
              value={createChannelState.name}
              placeholder="Enter name"
              errorMessage={createChannelState.nameError}
              onBlur={() => {
                validateFormField("name").catch((e) => console.error(e));
              }}
              onInputStateChanged={(text) => {
                onInputChange("name", text);
                onInputChange("nameError", undefined);
              }}
            />
            <InputField
              name="description"
              inputType="text"
              label="Description"
              value={createChannelState.description}
              placeholder="Please fill in the description"
              errorMessage={createChannelState.descriptionError}
              onBlur={() => {
                validateFormField("description").catch((e) => console.error(e));
              }}
              onInputStateChanged={(text) => {
                onInputChange("description", text);
                onInputChange("descriptionError", undefined);
              }}
            />
            <div className="checkbox-container">
              <label>
                <input
                  className="checkbox-container__checkbox"
                  type="checkbox"
                  checked={createChannelState.type === "private"}
                  onChange={() => {
                    if (createChannelState.type === "public") {
                      onInputChange("type", "private");
                      setAddUserVisible(true);
                    } else {
                      onInputChange("type", "public");
                      setAddUserVisible(false);
                    }
                  }}
                />
                Private
              </label>
            </div>
            <div className="base-modal__multiselect">
              {visible && (
                <Multiselect
                  ref={multiselectRef}
                  onSelect={onMemberSelect}
                  onRemove={onMemberRemove}
                  options={convertUsersToDropdownItems(remoteUsers)}
                  displayValue="key"
                  placeholder="Add Members"
                  hidePlaceholder
                  avoidHighlightFirstOption
                  style={{
                    chips: {
                      background: "#70A9A1",
                    },
                    searchBox: {
                      borderRadius: "0px",
                    },
                    inputField: {
                      margin: "6px",
                      fontSize: "16px",
                    },
                    optionContainer: {
                      maxHeight: "150px",
                    },
                  }}
                />
              )}
            </div>
            <div className="base-modal__submit-button">
              <button
                className="button__primary"
                type="submit"
                disabled={
                  createChannelState.name == "" ||
                  createChannelState.description == ""
                }
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default CreateChannelModal;
