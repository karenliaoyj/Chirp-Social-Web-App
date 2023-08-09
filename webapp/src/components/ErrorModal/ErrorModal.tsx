import React, { useMemo } from "react";
import {
  ChirpError,
  getAPIErrorTitleByErrorCode,
  isAPIError,
} from "../../errors/errors";
import Modal from "../Modal/Modal";

import "./ErrorModal.scss";

interface Props {
  error: ChirpError;
  isOpen: boolean;
  onRequestClose: () => void;
}

const ErrorModal: React.FC<Props> = (props) => {
  const { error, isOpen, onRequestClose } = props;

  const title = useMemo(() => {
    if (isAPIError(error)) {
      return getAPIErrorTitleByErrorCode(error.code);
    }
    if ("name" in error) {
      return error.name;
    }
    return "Error";
  }, [error]);

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div className="error-modal">
        <div className="error-modal__cancel" onClick={onRequestClose}>
          <i className="error-modal__cancel-icon"></i>
        </div>
        <div className="error-modal__title">{title}</div>
        <div className="error-modal__content">
          {error.message}
          <br />
          <br />
          <div className="error-modal__submit-button">
            <button className="button__plain" onClick={onRequestClose}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ErrorModal;
