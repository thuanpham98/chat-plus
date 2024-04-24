import "react";
import { Outlet } from "react-router-dom";
import { SideBar } from "./components/SideBar";
import "./style.css";
import React, { useEffect } from "react";
import { RdModulesManager, useRdQuery } from "@radts/reactjs";
import { AppRepository } from "@/application/services/app-repository";
import { MessageReponse } from "@/infrastructure/message-protobuf/message";
import { AppSession } from "@/application/services/app-session";
import { ProcessingImageModule } from "@/infrastructure/processing-image/processing-image-module";
import { Environment } from "@/application/services/environment";
import { IndexDbInteraction } from "@/infrastructure/index-db-interaction/index-db-module";

function mergeBuffer(buffer1: Uint8Array, buffer2: Uint8Array): Uint8Array {
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp;
}

export const HomeScreen = () => {
  const { isLoading, data, isSuccess } = useRdQuery({
    queryKey: ["get-user-info-from-home-page"],
    queryFn: async () => {
      const rdManager = new RdModulesManager();
      const ret = await rdManager
        .get<AppRepository>("AppRepository")
        .chat.user.userInfo();
      return ret;
    },
  });
  useEffect(() => {
    if (data && data.id && isSuccess) {
      const rdModule = new RdModulesManager();
      if (Environment.envType === "web") {
        rdModule.use(new IndexDbInteraction());
      }
      rdModule.use(new ProcessingImageModule());

      const socket = new WebSocket(`${Environment.hostWsMessage}`);
      socket.binaryType = "arraybuffer";

      let data = new Uint8Array();

      socket.addEventListener("open", () => {
        console.error("socker is opened");
      });

      socket.addEventListener("close", () => {
        console.error("socker is closed");
      });

      socket.addEventListener("error", (e) => {
        console.error("socker is error", e);
      });

      socket.addEventListener("message", (event) => {
        try {
          const frame = new Uint8Array(event.data as ArrayBuffer);
          if (frame.byteLength < 6) {
            return;
          }
          const dataLength =
            (frame[2] << 24) | (frame[3] << 16) | (frame[4] << 8) | frame[5];
          data = mergeBuffer(data, frame.subarray(6, dataLength + 6));

          if (frame[0] >> 7 === 1) {
            const resp = MessageReponse.fromBinary(data);
            data = new Uint8Array();
            rdModule.get<AppSession>("AppSession").message.next({
              id: resp.id,
              content: resp.content,
              createAt: resp.createAt,
              group: resp.group,
              receiver: resp.receiver,
              sender: resp.sender,
              type: resp.type.valueOf(),
            });
            if (Environment.envType === "web") {
              rdModule
                .get<IndexDbInteraction>("IndexDbInteraction")
                .createMessage({
                  id: resp.id,
                  content: resp.content,
                  createAt: resp.createAt,
                  group: resp.group,
                  receiver: resp.receiver,
                  sender: resp.sender,
                  type: resp.type.valueOf(),
                });
            }
          }
        } catch (error) {
          console.error(error);
        }
      });

      return () => {
        socket.close();
        if (Environment.envType === "web") {
          rdModule.get<IndexDbInteraction>("IndexDbInteraction").dispose();
        }
        rdModule.get<ProcessingImageModule>("ProcessingImageModule").dispose();
      };
    }
  }, [data, isSuccess]);

  if (isLoading) {
    return <></>;
  }
  return (
    <section className="home">
      <SideBar />
      <main className="app-body">
        <Outlet />
      </main>
    </section>
  );
};
