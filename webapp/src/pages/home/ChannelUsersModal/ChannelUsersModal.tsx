import React from "react";
import Modal from "../../../components/Modal/Modal";

import "./ChannelUsersModal.scss";
import { User } from "../../../models/user";

interface Props {
  users: User[];
  isOpen: boolean;
  onRequestClose: () => void;
}
const ChannelUsersModal: React.FC<Props> = (props) => {
  const { users, isOpen, onRequestClose } = props;

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div className="channel-user-modal">
        <div className="channel-user-modal__cancel" onClick={onRequestClose}>
          <i className="channel-user-modal__cancel-icon"></i>
        </div>
        <div className="channel-user-modal__title">Channel Members</div>
        <hr className="channel-user-modal__divider"></hr>
        <div className="channel-user-modal__wrapper">
          {users.map((user) => {
            return (
              <div key={user.id} className="channel-user-item">
                {user.username +
                  " (" +
                  user.firstName +
                  " " +
                  user.lastName +
                  ")"}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default ChannelUsersModal;
