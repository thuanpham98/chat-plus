import { ChatHttpClient } from "./chat-repository";
import { ErrorApi } from "../models/ErrorCustomModel";
import { IMessageRepository, MessageModel } from "@/domain/chat";

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

  public async listMessage({
    page,
    pageSize,
    receiver,
  }: {
    page: number;
    pageSize: number;
    receiver: string;
  }): Promise<MessageModel[]> {
    const resp = await this._c.message.listMessage({
      page: page,
      pageSize: pageSize,
      receiver: receiver,
    });
    if (resp?.data?.code === 0) {
      return (
        resp?.data?.data?.map((m): MessageModel => {
          return {
            id: m?.id ?? "",
            content: m?.content ?? "",
            createAt: m?.createAt ?? "",
            receiver: m?.receiver ?? "",
            sender: m?.sender ?? "",
            type: m?.type ?? 0,
            group: m?.group
              ? {
                  id: m.group.id,
                  name: m.group.name,
                }
              : undefined,
          };
        }) ?? []
      );
    } else {
      throw new ErrorApi({
        code: resp.data.code,
        message: resp.data.message,
        cause: "list message",
      });
    }
  }

  public async deleteMessage({ id }: { id: string }): Promise<boolean> {
    const resp = await this._c.message.deleteMessage({
      id: id,
    });
    if (resp?.data?.code === 0) {
      return resp?.data?.data ?? false;
    } else {
      throw new ErrorApi({
        code: resp.data.code,
        message: resp.data.message,
        cause: "delete message",
      });
    }
  }
}
