import { AccessTokenModel, IAuthRepository } from "@/domain/auth";
import { ChatHttpClient } from "./chat-repository";
import { ErrorApi } from "../models/ErrorCustomModel";

export class AuthRepository implements IAuthRepository {
  private _c: ChatHttpClient;

  constructor(config?: ChatHttpClient) {
    this._c = config;
  }

  public async login({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<AccessTokenModel> {
    const resp = await this._c.auth.login({
      password: password,
      username: username,
    });
    console.log(resp);
    if (resp?.data?.code === 0) {
      return { token: resp?.data?.data };
    } else {
      throw new ErrorApi({
        code: resp.data.code,
        message: resp.data.message,
        cause: "Login",
      });
    }
  }
}

