import axios from "axios";
import { ConfigurationApiParameters } from "./config";

export class AuthControllerApi {
  private _c: ConfigurationApiParameters;

  constructor(config?: ConfigurationApiParameters) {
    this._c = config;
  }

  public async login({ username, password }: { username; password }) {
    const ret = await axios({
      method: "post",
      baseURL: this._c.basePath,
      url: `/api/v1/auth/login`,
      data: {
        username: username,
        password: password,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    return ret.data;
  }
}
