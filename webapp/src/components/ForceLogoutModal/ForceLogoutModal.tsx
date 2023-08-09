import React, { useCallback } from "react";
import Modal from "../Modal/Modal";

import "./ForceLogoutModal.scss";
import { useUser } from "../../contexts/UserContextProvider";

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
}

const ForceLogoutModal: React.FC<Props> = (props) => {
  const { isOpen, onRequestClose } = props;
  const { logout } = useUser();

  const onLogoutClicked = useCallback(async () => {
    await logout();
    onRequestClose();
  }, [onRequestClose, logout]);

  return (
    <Modal isOpen={isOpen} dismissable={false}>
      <div className="force-logout-modal">
        <div className="force-logout-modal__title">
          Session Invalid or Expired
        </div>
        <div className="force-logout-modal__content">
          Please re-login Chirp to continue.
          <br />
          <br />
          <div className="force-logout-modal__submit-button">
            <button className="button__plain" onClick={onLogoutClicked}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ForceLogoutModal;
