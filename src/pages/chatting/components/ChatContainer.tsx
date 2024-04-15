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
// import { fromJS } from "immutable";
import { v4 as uuidv4 } from "uuid";

interface ChatContainerProps {
  isChatting: boolean;
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

export const ChatContainer: FC<ChatContainerProps> = ({
  isChatting,
  friend,
  userId,
}) => {
  const [state, setState] = useRdBloc<ChatContainerState>({
    queueFile: [],
  });

  const refFormMessage = useRef<HTMLFormElement>(null);
  const refTextMessage = useRef<HTMLTextAreaElement>(null);
  // const refQueueFile = useRef<
  //   {
  //     file: File;
  //     data: string;
  //     type: string;
  //   }[]
  // >([]);

  useEffect(() => {
    if (refTextMessage.current) {
      let check = false;
      refTextMessage.current.addEventListener("keypress", async (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();

          if (refTextMessage.current.value.trim().length > 0 && !check) {
            check = true;
            await submitAllMessage();
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
    if (_message.length !== 0) {
      sendMessageText(_message);
    }
    if (state.queueFile.length > 0) {
      const promises = state.queueFile.map((e) => sendMessageFile(e.file));
      await Promise.all(promises);
      state.queueFile.map((e) => {
        URL.revokeObjectURL(e.data);
      });
    }

    refTextMessage.current.value = "";
    state.queueFile = [];
    setState();
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
  console.debug(state.queueFile);

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
      <MessageFrame friendId={friend.id} userId={userId} />
      <form
        id={`form-${friend.id}`}
        ref={refFormMessage}
        onSubmit={(e) => {
          e.preventDefault();
          submitAllMessage();
        }}
        className="row"
        style={{
          width: "100%",
          height: "fit-content",
          margin: 0,
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
        >
          Thêm file
        </InputFile>
        <textarea
          role="textbox"
          rows={5}
          form={`form-${friend.id}`}
          style={{
            resize: "none",
            maxHeight: "120px",
            width: "100%",
            padding: "8px",
          }}
          ref={refTextMessage}
          placeholder="Gửi tin nhắn đi"
        />

        <button
          onClick={() => {
            refFormMessage.current.submit();
          }}
        >
          send
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

