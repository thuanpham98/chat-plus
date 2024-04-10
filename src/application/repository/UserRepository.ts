import { IUserRepository, UserModel } from "@/domain/auth";
import { ChatHttpClient } from "./chat-repository";
import { ErrorApi } from "../models/ErrorCustomModel";

export class UserRepository implements IUserRepository {
  private _c: ChatHttpClient;

  constructor(config?: ChatHttpClient) {
    this._c = config;
  }

  public async userInfo(): Promise<UserModel> {
    const resp = await this._c.user.userInfo();
    if (resp?.data?.code === 0) {
      return {
        email: resp?.data?.data?.email ?? "",
        id: resp?.data?.data?.id ?? "",
        name: resp?.data?.data?.name ?? "",
        phone: resp?.data?.data?.phone ?? "",
      };
    } else {
      throw new ErrorApi({
        code: resp.data.code,
        message: resp.data.message,
        cause: "get user info",
      });
    }
  }

  public async listFriends(): Promise<UserModel[]> {
    const resp = await this._c.user.listFriends();
    if (resp?.data?.code === 0) {
      return (
        resp?.data?.data?.map((d: any) => {
          return {
            email: d?.email ?? "",
            id: d?.id ?? "",
            name: d?.name ?? "",
            phone: d?.phone ?? "",
          };
        }) ?? []
      );
    } else {
      throw new ErrorApi({
        code: resp.data.code,
        message: resp.data.message,
        cause: "get list friend",
      });
    }
  }
}

