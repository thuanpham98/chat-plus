import axios from "axios";
import { ConfigurationApiParameters } from "./config";

export class UserControllerApi {
  private _c: ConfigurationApiParameters;

  constructor(config?: ConfigurationApiParameters) {
    this._c = config;
  }

  public async userInfo() {
    const ret = await axios({
      method: "get",
      baseURL: this._c.basePath,
      url: `/api/v1/user/info`,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return ret.data;
  }

  public async listFriends() {
    const ret = await axios({
      method: "get",
      baseURL: this._c.basePath,
      url: `/api/v1/user/friends`,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return ret.data;
  }
}

