import React from "react";
import ReactModal from "react-modal";

import "./Modal.scss";

interface Props {
  isOpen: boolean;
  onRequestClose?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  dismissable?: boolean;
  children?: React.ReactNode;
}

const Modal: React.FC<Props> = (props) => {
  const { dismissable = true } = props;
  return (
    <ReactModal
      portalClassName="modal"
      overlayClassName="modal__overlay"
      className="modal__content"
      isOpen={props.isOpen}
      ariaHideApp={false}
      onRequestClose={props.onRequestClose}
      shouldCloseOnEsc={dismissable}
      shouldCloseOnOverlayClick={dismissable}
    >
      <div className="modal__children">{props.children}</div>
    </ReactModal>
  );
};

export default Modal;
