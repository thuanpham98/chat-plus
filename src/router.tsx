import { Navigate, createHashRouter } from "react-router-dom";
import { RouterPath } from "./application/services/router-config";
import App from "./App";
import { HomeScreen } from "./pages/home";
import { AuthScreen } from "./pages/auth";
import { LoginPage } from "./pages/login";
import React from "react";
import { RdAppExtends } from "@radts/reactjs";

export function createAppRouter() {
  return createHashRouter([
    {
      path: RouterPath.root,
      element: (
        <RdAppExtends appProps={{}}>
          <App />
        </RdAppExtends>
      ),
      children: [
        {
          path: RouterPath.home,
          element: <HomeScreen />,
          children: [
            {
              index: true,
              element: <Navigate to={RouterPath.chatWithEveryOne} replace />,
            },
            {
              path: `${RouterPath.chatting}/*`,
              lazy: async () => {
                try {
                  const ChattingPage = (await import("../src/pages/chatting"))
                    .default;
                  return {
                    element: <ChattingPage />,
                  };
                } catch (error) {
                  console.error(error);
                  return {
                    element: (
                      <div style={{ width: "100vw", display: "block" }}>
                        MAChatWithEveryone is Failed Loading
                      </div>
                    ),
                  };
                }
              },
            },
            {
              path: `${RouterPath.chatWithEveryOne}/*`,
              lazy: async () => {
                try {
                  const MAChatWithEveryone = (
                    await import("../src/mini-apps/MAChatWithEveryone")
                  ).default;
                  return {
                    element: (
                      <MAChatWithEveryone
                        initPathName={RouterPath.chatWithEveryOne.toString()}
                      />
                    ),
                  };
                } catch (error) {
                  console.error(error);
                  return {
                    element: (
                      <div style={{ width: "100vw", display: "block" }}>
                        MAChatWithEveryone is Failed Loading
                      </div>
                    ),
                  };
                }
              },
            },
          ],
        },
        {
          path: RouterPath.auth,
          element: <AuthScreen />,
          children: [
            {
              index: true,
              element: <Navigate to={RouterPath.login} replace />,
            },
            {
              path: RouterPath.login,
              element: <LoginPage />,
            },
          ],
        },
      ],
    },
  ]);
}
