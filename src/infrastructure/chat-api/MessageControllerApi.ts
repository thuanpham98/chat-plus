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

  public async listMessage({
    page,
    pageSize,
    receiver,
  }: {
    page: number;
    pageSize: number;
    receiver: string;
  }) {
    const ret = await axios({
      method: "post",
      baseURL: this._c.basePath,
      url: `/api/v1/message/list`,
      data: {
        page: page,
        page_size: pageSize,
        receiver: receiver,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    return ret.data;
  }

  public async deleteMessage({ id }: { id: string }) {
    const ret = await axios({
      method: "post",
      baseURL: this._c.basePath,
      url: `/api/v1/message/delete`,
      data: {
        id: id,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    return ret.data;
  }
}

