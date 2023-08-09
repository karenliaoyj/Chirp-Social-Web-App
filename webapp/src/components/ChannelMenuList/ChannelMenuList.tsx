import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { ChannelMenuListContext } from "../../contexts/ChannelMenuListProvider";
import { Channel, ChannelType, DEFAULT_CHANNELS } from "../../models/channel";
import { Nullable } from "../../utils/types";
import CollapsibleMenuItem, {
  MenutItemIconType,
} from "../CollapsibleMenuItem/CollapsibleMenuItem";
import {
  ChannelMenuItem,
  CreateChannelMenuItem,
  SearchChannelMenuItem,
  MenuItem,
  MenuItemType,
} from "../CollapsibleMenuItem/types";

import "./ChannelMenuList.scss";
import { useErrorContext } from "../../contexts/ErrorContextProvider";

interface ChannelMenuListProps {
  selectedItem: Nullable<MenuItem>;
  onChannelItemSelected: (item: MenuItem) => void;
}
const ChannelMenuList: React.FC<ChannelMenuListProps> = (props) => {
  const { selectedItem, onChannelItemSelected } = props;
  const { handleError } = useErrorContext();

  const {
    state: { channels: fetchedChannels },
    actions: { getChannels },
  } = useContext(ChannelMenuListContext);

  useEffect(() => {
    (async () => {
      try {
        await getChannels();
      } catch (e) {
        handleError(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const channels = useMemo(() => {
    const channelList: Channel[] = [];
    fetchedChannels.forEach((it) => {
      channelList.push(it);
    });
    DEFAULT_CHANNELS.forEach((it) => {
      channelList.push(it);
    });
    return channelList;
  }, [fetchedChannels]);

  const onItemClicked = useCallback(
    (item: MenuItem) => {
      onChannelItemSelected(item);
    },
    [onChannelItemSelected]
  );

  const renderMenuItem = useCallback(() => {
    return channels.map((it) => {
      switch (it.type) {
        case ChannelType.Private:
        case ChannelType.Public:
          return (
            <CollapsibleMenuItem
              key={`channel-menu-item-${it.id}`}
              item={ChannelMenuItem(it)}
              onItemClicked={onItemClicked}
              iconType={
                it.type === ChannelType.Public
                  ? MenutItemIconType.PublicChannel
                  : MenutItemIconType.PrivateChannel
              }
              isSelected={
                selectedItem != null &&
                selectedItem.type === MenuItemType.Channel &&
                selectedItem.channel.id == it.id
              }
            />
          );
        case ChannelType.Create:
          return (
            <CollapsibleMenuItem
              key={`channel-menu-item-${it.id}`}
              item={CreateChannelMenuItem()}
              onItemClicked={onItemClicked}
              iconType={MenutItemIconType.CreateChannel}
              isSelected={false}
            />
          );
        case ChannelType.Search:
          return (
            <CollapsibleMenuItem
              key={`channel-menu-item-${it.id}`}
              item={SearchChannelMenuItem()}
              onItemClicked={onItemClicked}
              iconType={MenutItemIconType.SearchChannel}
              isSelected={false}
            />
          );
      }
    });
  }, [channels, onItemClicked, selectedItem]);

  return <div className="channel-menu-container">{renderMenuItem()}</div>;
};

export default ChannelMenuList;
