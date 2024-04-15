import { AppSession } from "@/application/services/app-session";
import { MessageModel } from "@/domain/chat";
import { RdModulesManager } from "@radts/reactjs";
import React, { useEffect, useState } from "react";
import { List } from "immutable";
import { MessageItem } from "./MessageItem";

interface MessageFrameProps {
  userId: string;
  friendId: string;
}

// interface MessageFrameState {
//   message: List<MessageModel>;
// }

const MessageFrame: React.FC<MessageFrameProps> = React.memo(
  ({ friendId, userId }) => {
    console.debug("chat reset");
    const [state, setState] = useState<List<MessageModel>>(
      List<MessageModel>(),
    );

    useEffect(() => {
      let currentMessage: List<MessageModel> = List<MessageModel>();
      // load all data message here

      // stream listen message from websocket
      const rdManager = new RdModulesManager();

      rdManager.get<AppSession>("AppSession").message.subscribe((mes) => {
        if (
          mes &&
          ((mes.sender === friendId && mes.receiver === userId) ||
            (mes.receiver === friendId && mes.sender === userId))
        ) {
          currentMessage = currentMessage.push(mes);
          setState(currentMessage);
        }
      });
    }, []);

    return (
      <div
        key={friendId}
        className="column"
        style={{
          width: "100%",
          height: "100%",
          flexDirection: "column-reverse",
          overflowY: "auto",
        }}
      >
        <div
          className="column"
          style={{
            height: "fit-content",
            gap: "4px",
            padding: "8px",
            width: "100%",
          }}
        >
          {state.map((mess) => {
            return (
              <MessageItem
                isSender={mess.sender === userId}
                message={mess}
                key={mess.id}
              />
            );
          })}
        </div>
      </div>
    );
  },
  () => {
    return true;
  },
);

export default MessageFrame;

