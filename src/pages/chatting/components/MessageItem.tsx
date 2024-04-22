import { Environment } from "@/application/services/environment";
import { MessageModel, MessageModelType } from "@/domain/chat";
import React from "react";

export const MessageItem = ({
  message,
  isSender,
  onDelete,
}: {
  message: MessageModel;
  isSender: boolean;
  onDelete: (id: string) => void;
}) => {
  return (
    <div
      className="row"
      style={{
        width: "100%",
        alignItems: "center",
        justifyContent: isSender ? "flex-end" : "flex-start",
        gap: "12px",
      }}
    >
      <button
        onClick={() => {
          onDelete(message.id);
        }}
        style={{
          cursor: "pointer",
          width: "24px",
          height: "24px",
          outline: "none",
          border: "none",
          backgroundColor: "transparent",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.0177 0.816179C13.7579 0.621381 13.4104 0.590048 13.1201 0.735241C12.8297 0.880434 12.6462 1.17723 12.6462 1.50189C12.6462 4.32167 11.9676 8.01156 8.5215 9.48441C8.05555 8.80819 7.61053 7.66358 7.61053 6.00189C7.61053 5.70482 7.4567 5.42894 7.204 5.27277C6.9513 5.11658 6.63575 5.10239 6.37005 5.23524C4.57737 6.13159 2.14624 8.67981 2.14624 13.5019C2.14624 16.7345 3.36698 19.2219 5.24642 20.8925C7.11009 22.5492 9.57074 23.359 12.0034 23.359C14.436 23.359 16.8967 22.5492 18.7603 20.8925C20.6397 19.2219 21.8604 16.7345 21.8604 13.5019C21.8604 7.03878 17.0072 3.05834 14.0177 0.816179Z"
            fill="#F80707"
          />
        </svg>
      </button>

      {message.type.valueOf() === MessageModelType.FILE.valueOf() && (
        <a
          rel="noreferrer"
          target="_blank"
          href={`${Environment.urlPublicImage}/${message.content}`}
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
          src={`${Environment.urlPublicImage}/${message.content}`}
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
