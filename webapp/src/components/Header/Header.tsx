import classNames from "classnames";
import React, { useCallback } from "react";
import { useUser } from "../../contexts/UserContextProvider";

import "./Header.scss";

interface Props {
  onMenuTriggered: () => void;
}

const Header: React.FC<Props> = (props) => {
  const { onMenuTriggered } = props;

  const { user, logout } = useUser();

  if (!user) {
    throw new Error("Unexpected user not found in the Home Page");
  }

  const onLogoutClicked = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <div className="menu-header">
      <div className="menu-left">
        <button id="menu-trigger" onClick={onMenuTriggered}>
          <span className={classNames("menu-stripe", "stripe-top")}></span>
        </button>
        <div className="menu-title">Chirp</div>
      </div>
      <div className="menu-right">
        <p>{`${user.firstName} ${user.lastName}`}</p>
        <button onClick={onLogoutClicked}>Logout</button>
      </div>
    </div>
  );
};

export default Header;
