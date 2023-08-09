import React, { useEffect, useRef, useState } from "react";
import { User } from "../../models/user";

import "./DropdownUser.scss";

interface DropdownUserProps {
  users: User[];
}

function DropdownUser(props: DropdownUserProps): JSX.Element {
  const { users } = props;
  const [isOpen, setIsOpen] = useState(false);

  const ref = useRef<HTMLInputElement>(null);

  const handleClickOutside: (e: MouseEvent) => void = (e) => {
    if (
      ref.current &&
      isOpen &&
      !ref.current.contains(e.target as Node | null)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });

  return (
    <div ref={ref}>
      <button
        className="dropdown-button"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        {" " + users.length}
      </button>
      {isOpen && (
        <div className="dropdown-list">
          <ul>
            {users.map((user, i) => (
              <li className="dropdown-object" key={i}>
                {user.username}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DropdownUser;
