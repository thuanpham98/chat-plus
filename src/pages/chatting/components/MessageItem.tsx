import { MessageModel } from "@/domain/chat";
import React from "react";

export const MessageItem = ({
  message,
  isSender,
}: {
  message: MessageModel;
  isSender: boolean;
}) => {
  return (
    <dt
      className="row"
      style={{
        width: "100%",
        alignItems: "center",
        justifyContent: isSender ? "flex-end" : "flex-start",
      }}
    >
      <span
        className="column"
        style={{
          width: "fit-content",
          minWidth: "36px",
          maxWidth: "calc(100% - 84px)",
          textAlign: "start",
          backgroundColor: isSender ? "#FFC0CB" : "#303030",
          color: isSender ? "#212121" : "#FFFFFF",
          padding: "8px",
          borderRadius: "12px",
          whiteSpace: "initial",
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </span>
    </dt>
  );
};

