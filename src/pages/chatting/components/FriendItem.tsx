import React, { useEffect, useState } from "react";
import "./style.css";

export const FriendItem = ({
  name,
  message,
  onSelect,
  selected,
}: {
  name: string;
  message: string;
  onSelect: () => void;
  selected: boolean;
}) => {
  const [state, setState] = useState(message);

  useEffect(() => {
    setState(message);
  }, [message]);

  return (
    <div
      className="chatting__item-friend"
      style={{
        backgroundColor: selected ? "rgb(39, 174, 96, 0.4)" : undefined,
      }}
      onClick={() => {
        onSelect();
      }}
    >
      <span>{name}</span>
      <span>{state}</span>
    </div>
  );
};

