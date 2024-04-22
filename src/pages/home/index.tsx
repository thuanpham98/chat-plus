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
      rdModule.use(new ProcessingImageModule());

      const socket = new WebSocket(`${Environment.hostWsMessage}`);
      socket.binaryType = "arraybuffer";

      socket.addEventListener("open", () => {
        // socket.send("Hello Server!");
      });

      socket.addEventListener("close", () => {
        console.error("socker . isclose");
      });

      socket.addEventListener("error", (e) => {
        console.error("socker is error", e);
      });

      socket.addEventListener("message", (event) => {
        const data = new Uint8Array(event.data as ArrayBuffer);
        const resp = MessageReponse.fromBinary(data);
        try {
          rdModule.get<AppSession>("AppSession").message.next({
            id: resp.id,
            content: resp.content,
            createAt: resp.createAt,
            group: resp.group,
            receiver: resp.receiver,
            sender: resp.sender,
            type: resp.type.valueOf(),
          });
        } catch (error) {
          console.error(error);
        }
      });

      return () => {
        socket.close();
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
