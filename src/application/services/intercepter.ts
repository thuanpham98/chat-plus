import { AxiosResponse } from "axios";
import { InternalAxiosRequestConfig } from "axios";
import { ErrorApi } from "../models/ErrorCustomModel";
import { chatConfig } from "../repository/chat-repository";
import { AppSession } from "./app-session";
import { RdModulesManager } from "@radts/reactjs";
import { LoginStatus } from "../models/LoginStatus";

export function onResponse(res: AxiosResponse) {
  return Promise.resolve(res);
}

export function onRequest(req: InternalAxiosRequestConfig) {
  if (req.headers !== undefined) {
    if ((req.url ?? "").startsWith(chatConfig.basePath ?? "")) {
      if (chatConfig.accessToken !== undefined) {
        req.headers["Authorization"] = `Bearer ${chatConfig.accessToken}`;
      }
    }
    // orther api host
    // ---------------
  }
  return Promise.resolve(req);
}
export async function onError(e: any) {
  console.error(">>>ERROR");
  console.error(e);
  // const { config } = e;
  // const originalReq = { ...config };

  const session = new RdModulesManager().get<AppSession>("AppSession");
  // const storage = new RdModulesManager().get<AppStorage>("AppStorage");
  // const api = new RdModulesManager().get<AppRepository>("AppRepository");

  switch (e.response.status.toString()) {
    case "401":
      //     try {
      //       if (storage.refreshToken.length > 0 && storage.countRefreshToken < 10) {
      //         lotusConfig.accessToken = undefined;
      //         storage.countRefreshToken = storage.countRefreshToken + 1;
      //         const retRefresh = await api.lotus.auth.refreshToken({
      //           refreshToken: storage.refreshToken,
      //         });
      //         if (retRefresh.refreshToken && retRefresh.token) {
      //           storage.accessToken = retRefresh.token;
      //           storage.refreshToken = retRefresh.refreshToken;
      //           lotusConfig.accessToken = retRefresh.token;
      //           if (originalReq) {
      //             originalReq.headers.Authorization = `Bearer ${retRefresh.token}`;
      //             setTimeout(() => {
      //               storage.countRefreshToken = 0;
      //             }, 20000);
      //             return Promise.resolve(axios(originalReq));
      //           }
      //         }
      //       }
      //       throw new ErrorApi({
      //         code: e.response.data.code,
      //         message: e.response.data.message,
      //       });
      //     } catch (error: any) {
      //       console.error(error);
      session?.loginStatus.next(LoginStatus.Expired);
      return Promise.reject(
        new ErrorApi({
          code: e.response.data.data.code,
          message: e.response.data.data.message,
        }),
      );
    //     }
  }

  return Promise.reject(
    new ErrorApi({
      code: e.response.data.data.code,
      message: e.response.data.data.message,
    }),
  );
}
