import React from "react";
import Collapsible from "react-collapsible";
import ChannelMenuList from "../ChannelMenuList/ChannelMenuList";
import { MenuItem } from "../CollapsibleMenuItem/types";
import ConversationMenuList from "../ConversationMenuList/ConversationMenuList";
import { Nullable } from "../../utils/types";

import "./CollapsibleMenu.scss";

interface Props {
  selectedItem: Nullable<MenuItem>;
  onMenuItemClicked: (item: MenuItem) => void;
}
const CollapsibleMenu: React.FC<Props> = (props) => {
  const { selectedItem, onMenuItemClicked } = props;

  return (
    <div className="collapsible-menu-container">
      <Collapsible
        transitionTime={100}
        transitionCloseTime={100}
        trigger="Channels"
        open={true}
      >
        <ChannelMenuList
          selectedItem={selectedItem}
          onChannelItemSelected={onMenuItemClicked}
        />
      </Collapsible>
      <Collapsible
        transitionTime={100}
        transitionCloseTime={100}
        trigger="Direct Messages"
        open={true}
      >
        <ConversationMenuList
          selectedItem={selectedItem}
          onConversationItemSelected={onMenuItemClicked}
        />
      </Collapsible>
    </div>
  );
};

export default CollapsibleMenu;
