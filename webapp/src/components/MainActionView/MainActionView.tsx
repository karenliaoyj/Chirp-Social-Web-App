import React, { useCallback, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

import "./MainActionView.scss";

export interface MainActionState {
  textareaStr: string;
}

const initState: MainActionState = {
  textareaStr: "",
};

interface Props {
  onSubmit: (state: MainActionState) => void;
}
const MainActionView: React.FC<Props> = (props) => {
  const { onSubmit } = props;
  const [mainActionState, setMainActionState] =
    useState<MainActionState>(initState);

  const onInputChange = useCallback(
    (
      key: keyof MainActionState,
      data: MainActionState[keyof MainActionState]
    ) => {
      setMainActionState((state: MainActionState) => ({
        ...state,
        [key]: data,
      }));
    },
    [setMainActionState]
  );

  const submit = useCallback(() => {
    onSubmit(mainActionState);
    setMainActionState(initState);
  }, [mainActionState, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit]
  );

  return (
    <div className="textarea__wrapper">
      <TextareaAutosize
        autoFocus
        cacheMeasurements
        className="textarea__textarea"
        minRows={2}
        maxRows={10}
        value={mainActionState.textareaStr}
        onChange={(e) => {
          onInputChange("textareaStr", e.target.value);
        }}
        onKeyDown={handleKeyDown}
      />
      <button className="textarea__button" onClick={submit}>
        <i className="textarea__submit-icon"></i>
      </button>
    </div>
  );
};

export default MainActionView;
