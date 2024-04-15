import { MessageModel, MessageModelType } from "@/domain/chat";
import React from "react";

export const MessageItem = ({
  message,
  isSender,
}: {
  message: MessageModel;
  isSender: boolean;
}) => {
  return (
    <div
      className="row"
      style={{
        width: "100%",
        alignItems: "center",
        justifyContent: isSender ? "flex-end" : "flex-start",
      }}
    >
      {message.type.valueOf() === MessageModelType.FILE.valueOf() && (
        <a
          rel="noreferrer"
          target="_blank"
          href={`http://localhost:6969/api/v1/storage/public/image/${message.content}`}
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
        </a>
      )}
      {message.type.valueOf() === MessageModelType.IMAGE.valueOf() && (
        <img
          src={`http://localhost:6969/api/v1/storage/public/image/${message.content}`}
          style={{ width: "320px" }}
        />
      )}
      {message.type.valueOf() === MessageModelType.TEXT.valueOf() && (
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
      )}
    </div>
  );
};

