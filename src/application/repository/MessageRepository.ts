import { ChatHttpClient } from "./chat-repository";
import { ErrorApi } from "../models/ErrorCustomModel";
import { IMessageRepository } from "@/domain/chat";

export class MessageRepository implements IMessageRepository {
  private _c: ChatHttpClient;

  constructor(config?: ChatHttpClient) {
    this._c = config;
  }

  public async sendToFriend({ data }: { data: Uint8Array }): Promise<boolean> {
    const resp = await this._c.message.sendToFriend({
      data: data,
    });
    if (resp?.data?.code === 0) {
      return resp?.data?.data ?? false;
    } else {
      throw new ErrorApi({
        code: resp.data.code,
        message: resp.data.message,
        cause: "send message to friends",
      });
    }
  }
}

