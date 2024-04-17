import { UserModel } from "@/domain/auth";
import { RdModulesManager, useRdBloc } from "@radts/reactjs";
import React, { FC, useEffect, useRef } from "react";
import { InputFile } from "@/components/input-file/InputFile";
import {
  MessageRequest,
  MessageType,
} from "@/infrastructure/message-protobuf/message";
import { AppRepository } from "@/application/services/app-repository";
import { ProcessingImageModule } from "@/infrastructure/processing-image/processing-image-module";
import { WeightQueuePriority } from "@/infrastructure/processing-image/priorrity-queue";
import MessageFrame from "./MessageFrame";
import chattingBg from "../../../assets/images/img-chat-background.png";

import { v4 as uuidv4 } from "uuid";

interface ChatContainerProps {
  friend: UserModel;
  userId: string;
}

interface ChatContainerState {
  queueFile: {
    file: File | null;
    data: string;
    type: string;
    id: string;
    isImage: boolean;
  }[];
}

export const ChatContainer: FC<ChatContainerProps> = ({ friend, userId }) => {
  const [state, setState] = useRdBloc<ChatContainerState>({
    queueFile: [],
  });
  // const refFormMessage = useRef<HTMLFormElement>(null);
  const refTextMessage = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (refTextMessage.current) {
      let check = false;
      refTextMessage.current.addEventListener("keypress", async (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();

          if (refTextMessage.current.value.trim().length > 0 && !check) {
            check = true;
            submitAllMessage();
            setTimeout(() => {
              check = false;
            }, 500);
          }
        }
      });
    }
  }, [refTextMessage.current]);

  async function sendMessageText(text: string) {
    try {
      const rdManage = new RdModulesManager();
      const message = MessageRequest.toBinary(
        MessageRequest.create({
          content: text,
          receiver: friend.id,
          type: MessageType.TEXT,
        }),
      );

      rdManage.get<AppRepository>("AppRepository").chat.message.sendToFriend({
        data: message,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function sendMessageFile(file: File) {
    let mime: MessageType = MessageType.FILE;
    if (file.type.startsWith("image/")) {
      mime = MessageType.IMAGE;
    }

    try {
      const rdManage = new RdModulesManager();
      const url = await rdManage
        .get<AppRepository>("AppRepository")
        .chat.storage.uploadFile(file);

      const message = MessageRequest.toBinary(
        MessageRequest.create({
          content: url,
          receiver: friend.id,
          type: mime,
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

  async function submitAllMessage() {
    const _message = refTextMessage.current.value.trim();
    refTextMessage.current.value = "";
    try {
      if (_message.length !== 0) {
        await sendMessageText(_message);
      }
      if (state.queueFile.length > 0) {
        // state.queueFile.map((e) => sendMessageFile(e.file).finally(()=>{
        //   URL.revokeObjectURL(e.data);
        // }));
        Promise.all(
          state.queueFile.map((e) =>
            sendMessageFile(e.file).finally(() => {
              URL.revokeObjectURL(e.data);
            }),
          ),
        ).finally(() => {
          state.queueFile = [];
          setState();
        });
        // state.queueFile.map((e) => {
        //   URL.revokeObjectURL(e.data);
        // });
      }
    } catch (error) {
      console.error(error);
    }
  }

  function resizeImage(path: string, id: string) {
    const rdManager = new RdModulesManager();
    rdManager.get<ProcessingImageModule>("ProcessingImageModule").stopProcess();
    const ticket = rdManager
      .get<ProcessingImageModule>("ProcessingImageModule")
      .pushImage(path, WeightQueuePriority.LEVEL6);
    const sub = rdManager
      .get<ProcessingImageModule>("ProcessingImageModule")
      .subcrise((v: any) => {
        if (v.ticket === ticket) {
          URL.revokeObjectURL(path);
          const blob = v.data as Blob;
          const datat = URL.createObjectURL(blob);
          const ele = state.queueFile.findIndex((e) => e.id === id);
          if (ele > -1) {
            const oldFile = state.queueFile[ele].file;
            state.queueFile[ele].data = datat;
            state.queueFile[ele].file = new File([blob], oldFile.name, {
              type: blob.type,
            });
            setState();
          }
          sub.unsubscribe();
        }
      });

    rdManager
      .get<ProcessingImageModule>("ProcessingImageModule")
      .startProcess();
  }

  return (
    <div
      className="column"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#FFFFFF",
        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
        backgroundImage: `url("${chattingBg}")`,
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
          backgroundColor: "#FFFFFF",
          boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
        }}
      >
        <span>{friend.name}</span>
      </div>
      <MessageFrame friendId={friend.id} userId={userId} />
      <form
        id={`form-${friend.id}`}
        // ref={refFormMessage}
        onSubmit={(e) => {
          e.preventDefault();
          submitAllMessage();
        }}
        className="row"
        style={{
          width: "100%",
          height: "fit-content",
          margin: 0,
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(2px)",
          border: "none",
          padding: "0px 8px",
        }}
      >
        <InputFile
          onChange={(dataUrl, f, typeImage) => {
            console.debug(f);
            const element = {
              data: dataUrl,
              file: f,
              type: f.type,
              isImage: typeImage.length > 0,
              id: uuidv4(),
            };
            state.queueFile.push(element);
            if (typeImage.length > 0 && f.size > 300000) {
              resizeImage(element.data, element.id);
            } else {
              setState();
            }
          }}
          style={{
            width: "32px",
            height: "32px",
            padding: "4px",
            cursor: "pointer",
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
              d="M22.0425 11.6344L11.9632 21.7984C11.5721 22.1968 11.1055 22.5135 10.5907 22.7295C10.0759 22.9456 9.52317 23.0569 8.96484 23.0569C8.4065 23.0569 7.85378 22.9456 7.33894 22.7295C6.82413 22.5135 6.35753 22.1968 5.96647 21.7984L2.95114 18.7323C2.16178 17.9305 1.71936 16.8506 1.71936 15.7255C1.71936 14.6003 2.16178 13.5203 2.95114 12.7186L13.6911 1.94479C14.006 1.62724 14.3808 1.37519 14.7936 1.20319C15.2065 1.03118 15.6493 0.942627 16.0966 0.942627C16.5438 0.942627 16.9867 1.03118 17.3995 1.20319C17.8123 1.37519 18.1871 1.62724 18.502 1.94479L19.7047 3.14753C20.0224 3.46248 20.2744 3.83721 20.4463 4.25006C20.6185 4.66291 20.7069 5.10574 20.7069 5.553C20.7069 6.00026 20.6185 6.44309 20.4463 6.85594C20.2744 7.26881 20.0224 7.64352 19.7047 7.95847L10.1845 17.5126C10.027 17.6715 9.83967 17.7975 9.63324 17.8834C9.42682 17.9694 9.20541 18.0136 8.98178 18.0136C8.75815 18.0136 8.53673 17.9694 8.3303 17.8834C8.12388 17.7975 7.93651 17.6715 7.77903 17.5126L7.18613 16.9028C7.02735 16.7453 6.90134 16.5579 6.81533 16.3515C6.72934 16.1451 6.68506 15.9237 6.68506 15.7C6.68506 15.4764 6.72934 15.255 6.81533 15.0486C6.90134 14.8422 7.02735 14.6548 7.18613 14.4973L13.5725 8.16175"
              stroke="#EE10F3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </InputFile>
        <textarea
          className="chatting__input-message"
          role="textbox"
          rows={5}
          form={`form-${friend.id}`}
          ref={refTextMessage}
          placeholder="Gửi tin nhắn đi"
        />

        <button
          onClick={() => {
            submitAllMessage();
            // refFormMessage.current.submit();
          }}
          className="row"
          style={{
            width: "32px",
            height: "32px",
            cursor: "pointer",
            border: "none",
            outline: "none",
            background: "transparent",
            padding: "4px",
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
              d="M10.2857 13.7143L0.857178 9.42861L23.1429 0.857178L14.5715 23.1429L10.2857 13.7143Z"
              stroke="#E00BF2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#EE10F3"
            />
            <path
              d="M10.2858 13.7144L15.4286 8.57153"
              stroke="#E00BF2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#EE10F3"
            />
          </svg>
        </button>
      </form>
      <div
        className="row"
        style={{
          width: "100%",
          height: "fit-content",
          display: state.queueFile.length > 0 ? undefined : "none",
          padding: "12px",
          overflowX: "auto",
        }}
      >
        <div
          className="row"
          style={{
            width: "auto",
            gap: "12px",
          }}
        >
          {state.queueFile.map((v) => {
            if (v.isImage) {
              return (
                <img
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    objectPosition: "center",
                    borderRadius: "8px",
                  }}
                  key={v.id}
                  alt={v.file.name}
                  src={v.data}
                />
              );
            }

            return (
              <div
                key={v.file.name}
                className="column"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "8px",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  border: "1px solid gray",
                }}
              >
                <span
                  style={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    width: "100%",
                  }}
                >
                  {v.file.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

