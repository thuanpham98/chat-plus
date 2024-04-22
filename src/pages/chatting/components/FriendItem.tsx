import React, { useTransition } from "react";
import "./style.css";

export const FriendItem = ({
  name,
  onSelect,
  selected,
}: {
  name: string;
  message: string;
  onSelect: () => void;
  selected: boolean;
}) => {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className="chatting__item-friend"
      style={{
        backgroundColor: selected ? "rgb(39, 174, 96, 0.4)" : undefined,
        pointerEvents: isPending ? "none" : undefined,
      }}
      onClick={() => {
        startTransition(() => {
          onSelect();
        });
      }}
    >
      <span
        style={{
          color: "#333333",
          fontSize: "14",
          lineHeight: "20px",
          fontWeight: "600",
        }}
      >
        {name}
      </span>
    </div>
  );
};
