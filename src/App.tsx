import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { RouterPath } from "./application/services/router-config";
import { router } from "./bootstrap";
import { RdModulesManager } from "@radts/reactjs";
import { LoginStatus } from "./application/models/LoginStatus";
import "./styles";
import React from "react";
import { AppStorage } from "./application/services/app-storage";
import { AppSession } from "./application/services/app-session";
import { chatConfig } from "./application/repository/chat-repository";

function App() {
  const rdManager = new RdModulesManager();
  const storage = rdManager.get<AppStorage>("AppStorage");
  const session = rdManager.get<AppSession>("AppSession");

  const location = useLocation();

  const [isLoading, setLoading] = useState<boolean>(true);

  if (storage.isLogin) {
    session.loginStatus.next(LoginStatus.Success);
  } else {
    session.loginStatus.next(LoginStatus.Expired);
  }

  useEffect(() => {
    let currentLoginStatus = LoginStatus.Idle;

    rdManager.get<AppSession>("AppSession").loginStatus.subscribe(async (v) => {
      if (currentLoginStatus === v) {
        return;
      } else {
        currentLoginStatus = v;
      }
      setLoading(true);

      if (v === LoginStatus.Success) {
        chatConfig.accessToken = storage.accessToken;
        if (
          location.pathname.startsWith(RouterPath.auth.toString()) ||
          location.pathname.replace("/", "") === ""
        ) {
          await router.navigate(`${RouterPath.home}${window.location.search}`, {
            replace: true,
          });
        } else {
          await router.navigate(
            `${location.pathname}${window.location.search}`,
            {
              replace: true,
            },
          );
        }

        storage.isLogin = true;
      } else if (v === LoginStatus.Expired) {
        storage.accessToken = "";
        // storage.accessToken && repo.lotus.auth.logout(storage.refreshToken);
        chatConfig.accessToken = undefined;
        storage.clearAll();
        if (
          location.pathname.replaceAll("/", "") ===
            RouterPath.auth.replaceAll("/", "") ||
          !location.pathname.startsWith(RouterPath.auth) ||
          location.pathname.replaceAll("/", "") === ""
        ) {
          await router.navigate(
            `${RouterPath.auth}/login${window.location.search}`,
            {
              replace: true,
            },
          );
        } else if (location.pathname.startsWith(RouterPath.auth)) {
          await router.navigate(
            `${location.pathname}${window.location.search}`,
            {
              replace: true,
            },
          );
        }
      }
      setLoading(false);
    });
  }, []);

  if (isLoading) {
    return <></>;
  }

  return <Outlet />;
}
export default App;

