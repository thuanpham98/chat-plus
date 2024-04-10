import axios from "axios";
import { ConfigurationApiParameters } from "./config";

export class MessageControllerApi {
  private _c: ConfigurationApiParameters;

  constructor(config?: ConfigurationApiParameters) {
    this._c = config;
  }

  public async sendToFriend({ data }: { data: Uint8Array }) {
    const ret = await axios({
      method: "post",
      baseURL: this._c.basePath,
      url: `/api/v1/message/send`,
      data: data,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
    return ret.data;
  }
}

