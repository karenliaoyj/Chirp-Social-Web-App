import classnames from "classnames";
import React, { useState, useEffect, useRef } from "react";

import "./InputField.scss";

interface InputFieldProps {
  name: string;
  value: string;
  inputType?: HTMLInputElement["type"];
  label: string;
  placeholder: string;
  errorMessage?: string;
  onBlur?: () => void;
  onInputStateChanged: (text: string) => void;
  disabled?: boolean;
  focused?: boolean;
}

const InputField: React.FC<InputFieldProps> = (props) => {
  const { disabled = false } = props;
  const [active, setActive] = useState(false);
  const [currentType, setCurrentType] = useState(props.inputType || "text");

  const showEyeButton = props.inputType === "password";
  const [isEmpty, setIsEmpty] = useState(true);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current && props.focused) ref.current.focus();
  }, [props.focused]);

  useEffect(() => {
    setIsEmpty(props.value.length === 0);
  }, [props.value]);

  return (
    <div className="input-field">
      <label
        className={classnames("input-field__label", {
          "input-field__label--active": active,
          "input-field__label--empty": !active && isEmpty,
          "input-field__label--disabled": disabled,
        })}
        htmlFor={`${props.name}___input`}
        id={`${props.name}__label`}
      >
        {props.label}
      </label>

      {showEyeButton && (
        <div
          className={classnames("input-field__eye-button", {
            "input-field__eye-button--open": currentType !== "password",
          })}
          onClick={() => {
            if (currentType === "password") {
              setCurrentType("text");
            } else {
              setCurrentType("password");
            }
          }}
        />
      )}

      <div>
        <input
          ref={ref}
          disabled={disabled}
          className={classnames("input-field__input", {
            "input-field__input--active": active,
            "input-field__input--with-eye-button": showEyeButton,
            "input-field__input--error": !!props.errorMessage,
            "input-field__input--disabled": disabled,
          })}
          type={currentType}
          autoComplete="off"
          id={`${props.name}___input`}
          name={`${props.name}___name`}
          placeholder={props.placeholder}
          aria-label={props.label}
          onFocus={() => setActive(true)}
          onBlur={() => {
            if (props.onBlur) {
              props.onBlur();
            }
            setActive(false);
          }}
          onChange={(e) => {
            props.onInputStateChanged(e.target.value);
          }}
          value={props.value}
        />
      </div>

      <div className="input-field__error">{props.errorMessage}</div>
    </div>
  );
};

export default InputField;
