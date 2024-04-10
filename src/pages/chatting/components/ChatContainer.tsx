import { AppRepository } from "@/application/services/app-repository";
import { AppSession } from "@/application/services/app-session";
import { Input } from "@/components/input/Input";
import { UserModel } from "@/domain/auth";
import { MessageModel } from "@/domain/chat";
import {
  MessageRequest,
  MessageType,
} from "@/infrastructure/message-protobuf/message";
import { RdModulesManager, useRdBloc } from "@radts/reactjs";
import React, { FC, useEffect } from "react";
import { MessageItem } from "./MessageItem";

interface ChatContainerProps {
  isChatting: boolean;
  friend: UserModel;
  userId: string;
}

interface ChatContainerState {
  message: string;
  messageHistory: MessageModel[];
}

export const ChatContainer: FC<ChatContainerProps> = ({
  isChatting,
  friend,
  userId,
}) => {
  const [state, setState] = useRdBloc<ChatContainerState>({
    message: "",
    messageHistory: [],
  });

  useEffect(() => {
    // load all data message here

    // stream listen message from websocket
    const rdManager = new RdModulesManager();
    rdManager.get<AppSession>("AppSession").message.subscribe((mes) => {
      // console.log(mes);
      if (
        mes &&
        ((mes.sender === friend.id && mes.receiver === userId) ||
          (mes.receiver === friend.id && mes.sender === userId))
      ) {
        state.messageHistory.push(mes);
        setState();
      }
    });
  }, []);

  async function sendMessage() {
    try {
      const rdManage = new RdModulesManager();
      const message = MessageRequest.toBinary(
        MessageRequest.create({
          content: state.message,
          receiver: friend.id,
          type: MessageType.TEXT,
        }),
      );
      await rdManage
        .get<AppRepository>("AppRepository")
        .chat.message.sendToFriend({
          data: message,
        });
    } catch (error) {
      console.error(error);
    }
  }

  console.log(state.messageHistory);

  return (
    <div
      className="column"
      style={{
        display: isChatting ? "flex" : "none",
        width: "100%",
        height: "100%",
        backgroundColor: "#FFFFFF",
        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
      }}
    >
      <div
        className="row"
        style={{
          width: "100%",
          padding: "12px",
          justifyItems: "flex-start",
          alignItems: "center",
          color: "#0D1C2E",
          fontSize: "16px",
          lineHeight: "24px",
          fontWeight: "600",
          borderBottom: "1px solid gray",
        }}
      >
        <span>{friend.name}</span>
      </div>
      <div
        className="column"
        style={{
          width: "100%",
          height: "100%",
          flexDirection: "column-reverse",
          overflowY: "auto",
        }}
      >
        <dl
          className="column"
          style={{
            height: "fit-content",
            gap: "4px",
            padding: "8px",
            width: "100%",
          }}
        >
          {state.messageHistory.map((mess) => {
            return (
              <MessageItem
                isSender={mess.sender === userId}
                message={mess}
                key={mess.id}
              />
            );
          })}
        </dl>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log("sumiit data");
        }}
        className="row"
        style={{
          width: "100%",
          height: "fit-content",
          flex: 1,
          margin: 0,
        }}
      >
        <Input
          onChange={(e) => {
            state.message = e.currentTarget.value;
          }}
          placeholder="Gửi tin nhắn đi"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          send
        </button>
      </form>
    </div>
  );
};

