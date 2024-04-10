import "react";
import { Outlet } from "react-router-dom";
import { SideBar } from "./components/SideBar";
import "./style.css";
import React, { useEffect } from "react";
import { RdModulesManager, useRdQuery } from "@radts/reactjs";
import { AppRepository } from "@/application/services/app-repository";
import { MessageReponse } from "@/infrastructure/message-protobuf/message";
import { AppSession } from "@/application/services/app-session";
import { MessageModelType } from "@/domain/chat";
// import { MessageReponse } from "@/infrastructure/message-protobuf/message";

export const HomeScreen = () => {
  const { isLoading, data } = useRdQuery({
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
    // Create WebSocket connection.
    if (data && data.id) {
      const socket = new WebSocket(`ws://localhost:6969/user/ws/message`);
      socket.binaryType = "arraybuffer";
      // Connection opened
      socket.addEventListener("open", () => {
        socket.send("Hello Server!");
      });

      socket.addEventListener("close", () => {
        console.error("socker . isclose");
      });

      socket.addEventListener("error", (e) => {
        console.error("socker is error", e);
      });

      const rdModule = new RdModulesManager();

      // Listen for messages
      socket.addEventListener("message", (event) => {
        const data = new Uint8Array(event.data as ArrayBuffer);
        const resp = MessageReponse.fromBinary(data);
        try {
          rdModule.get<AppSession>("AppSession").message.next({
            id: resp.id,
            content: resp.content,
            createAt: resp.createAt,
            Group: resp.group,
            receiver: resp.receiver,
            sender: resp.sender,
            type: MessageModelType[
              resp.type.toString() as keyof typeof MessageModelType
            ],
          });
        } catch (error) {
          console.error(error);
        }
      });

      return () => {
        socket.close();
      };
    }
  }, [data]);

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

