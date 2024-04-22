import { AxiosResponse } from "axios";
import { InternalAxiosRequestConfig } from "axios";
import { ErrorApi } from "../models/ErrorCustomModel";
import { AppSession } from "./app-session";
import { RdModulesManager } from "@radts/reactjs";
import { LoginStatus } from "../models/LoginStatus";

export function onResponse(res: AxiosResponse) {
  return Promise.resolve(res);
}

export function onRequest(req: InternalAxiosRequestConfig) {
  // if (req.headers !== undefined) {
  //   if ((req.baseURL ?? "").startsWith(chatConfig.basePath ?? "")) {
  //     if (chatConfig.accessToken !== undefined) {
  //       req.headers["Authorization"] = `Bearer ${chatConfig.accessToken}`;
  //     }
  //   }
  //   // orther api host
  //   // ---------------
  // }
  return Promise.resolve(req);
}
export async function onError(e: any) {
  console.error(">>>ERROR");
  console.error(e);

  const session = new RdModulesManager().get<AppSession>("AppSession");

  switch (e.response.status.toString()) {
    case "401":
      session?.loginStatus.next(LoginStatus.Expired);
      return Promise.reject(
        new ErrorApi({
          code: e.response.data.data.code,
          message: e.response.data.data.message,
        }),
      );
  }

  return Promise.reject(
    new ErrorApi({
      code: e.response.data.data.code,
      message: e.response.data.data.message,
    }),
  );
}
