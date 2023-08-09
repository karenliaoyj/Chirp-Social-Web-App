import classnames from "classnames";
import React, { useState, useEffect, useRef, useCallback } from "react";

import "./DropdownField.scss";
import { DropdownItem } from "./types";

interface DropdownFieldProps<T> {
  initialIndex: number;
  title: string;
  label: string;
  errorMessage?: string;
  options: DropdownItem<T>[];
  onBlur?: () => void;
  onInputStateSelected: (item: DropdownItem<T>) => void;
  focused?: boolean;
}

function DropdownField<T>(props: DropdownFieldProps<T>): JSX.Element {
  const [selected, setSelected] = useState(props.initialIndex);
  const [active, setActive] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const selectedOptionKey = props.options[selected]
    ? props.options[selected].key
    : undefined;

  const ref = useRef<HTMLDivElement>(null);

  const dropdownListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (ref.current && props.focused) ref.current.focus();
  }, [props.focused]);

  const handleClickOutside: (e: MouseEvent) => void = (e) => {
    if (ref.current && !ref.current.contains(e.target as Node | null)) {
      setActive(false);
    }
  };

  const updateSelected = useCallback(
    (index: number) => {
      setSelected(index);
      props.onInputStateSelected(props.options[index]);
    },
    [props, setSelected]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });

  useEffect(() => {
    setIsEmpty(selected === -1);
  }, [selected]);

  const scrollTo = useCallback((destination: number) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    dropdownListRef.current!.scrollTo({
      top: Math.max(0, destination) * 52,
    });
  }, []);

  const downHandler = useCallback(
    (e: KeyboardEvent) => {
      let nextSelected = selected;
      switch (e.key) {
        case "ArrowUp":
          nextSelected = nextSelected - 1;
          break;
        case "ArrowDown":
          nextSelected = nextSelected + 1;
          break;
        case "Enter":
          setActive(false);
          break;
        default:
          break;
      }
      if (nextSelected >= 0 && nextSelected < props.options.length) {
        updateSelected(nextSelected);
      }
      scrollTo(nextSelected - 2);
      e.preventDefault();
    },
    [scrollTo, selected, updateSelected, props]
  );

  const typeInHandler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key.length === 1) {
        for (let i = 0; i < props.options.length; ++i) {
          if (
            props.options[i].key.toUpperCase()[0] === e.key.toUpperCase()[0]
          ) {
            updateSelected(i);
            scrollTo(i);
            break;
          }
        }
      }
    },
    [scrollTo, props.options, updateSelected]
  );

  useEffect(() => {
    if (active) {
      window.addEventListener("keydown", typeInHandler);
      return () => window.removeEventListener("keydown", typeInHandler);
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }, [active, typeInHandler]);

  useEffect(() => {
    if (active) {
      window.addEventListener("keydown", downHandler);
      return () => window.removeEventListener("keydown", downHandler);
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }, [active, downHandler]);

  const renderOptions = useCallback(() => {
    return props.options.map((option, index) => {
      return (
        <li
          onClick={() => {
            updateSelected(index);
            setActive((active) => {
              return !active;
            });
          }}
          key={index}
          className={classnames("dropdown__list-item", {
            "dropdown__list-item--active": index === selected,
          })}
        >
          {option.key}
        </li>
      );
    });
  }, [selected, props, updateSelected]);

  return (
    <>
      <div
        className="dropdown"
        ref={ref}
        tabIndex={0}
        onFocus={() => {
          setTimeout(() => {
            setActive(true);
          }, 100);
        }}
        onBlur={() => {
          setActive(false);
        }}
      >
        <label
          className={classnames("dropdown__label", {
            "dropdown__label--active": active,
            "dropdown__label--empty": !active && isEmpty,
          })}
          htmlFor={`${props.title}___input`}
          id={`${props.title}__label`}
        >
          {props.label}
        </label>
        <div
          onClick={() => setActive(!active)}
          className={classnames("dropdown__input", {
            "dropdown__input--active": active,
            "dropdown__input--error": !!props.errorMessage,
          })}
        >
          {selectedOptionKey !== undefined && props.options[selected].key}
        </div>
        <div className="dropdown__toggle"></div>
        <ul
          ref={dropdownListRef}
          className={classnames("dropdown__list", {
            "dropdown__list--active": active,
          })}
        >
          {renderOptions()}
        </ul>
      </div>
      {props.errorMessage && (
        <div className="dropdown__error">{props.errorMessage}</div>
      )}
    </>
  );
}

export default DropdownField;
