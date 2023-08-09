import React, { useCallback, useState } from "react";
import classNames from "classnames";
import "./ContentContainer.scss";
import { SecondaryContent } from "../../pages/home/types";
import { Nullable } from "../../utils/types";
import CollapsibleMenu from "../CollapsibleMenu/CollapsibleMenu";
import Header from "../Header/Header";
import ContentView from "../ContentView/ContentView";
import { MenuItem } from "../CollapsibleMenuItem/types";

type Props = {
  secondaryContent: Nullable<SecondaryContent>;
  onSecondaryContentDismissed: (content: SecondaryContent) => void;
  selectedItem: Nullable<MenuItem>;
  onMenuItemClicked: (item: MenuItem) => void;
} & React.PropsWithChildren;

export const ContentContainer: React.FC<Props> = (props) => {
  const {
    secondaryContent,
    onSecondaryContentDismissed,
    selectedItem,
    onMenuItemClicked,
  } = props;
  const [isMenuExpanded, setIsMenuExpanded] = useState<boolean>(true);

  const onMenuTriggered = useCallback(() => {
    setIsMenuExpanded((prev) => !prev);
  }, []);

  const renderSideMenu = useCallback(() => {
    return (
      <div
        id="side"
        className={classNames(
          "side-menu-container",
          isMenuExpanded ? "slide-in" : ""
        )}
      >
        <CollapsibleMenu
          selectedItem={selectedItem}
          onMenuItemClicked={onMenuItemClicked}
        />
      </div>
    );
  }, [isMenuExpanded, onMenuItemClicked, selectedItem]);

  const renderContent = useCallback(() => {
    return (
      <div
        id="main"
        className={classNames(
          "page-content",
          isMenuExpanded ? "slide-content" : ""
        )}
      >
        <ContentView
          secondaryContent={secondaryContent}
          onSecondaryContentDismissed={onSecondaryContentDismissed}
        >
          {props.children}
        </ContentView>
      </div>
    );
  }, [
    isMenuExpanded,
    onSecondaryContentDismissed,
    props.children,
    secondaryContent,
  ]);

  return (
    <div
      className={classNames(
        "container",
        secondaryContent
          ? "container-background-secondary"
          : "container-background-primary"
      )}
    >
      <Header onMenuTriggered={onMenuTriggered} />
      {renderSideMenu()}
      {renderContent()}
    </div>
  );
};
