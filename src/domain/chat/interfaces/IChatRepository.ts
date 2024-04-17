import { MessageModel } from "../models/MessageModel";

export interface IMessageRepository {
  sendToFriend({ data }: { data: Uint8Array }): Promise<boolean>;
  listMessage({
    page,
    pageSize,
    receiver,
  }: {
    page: number;
    pageSize: number;
    receiver: string;
  }): Promise<MessageModel[]>;

  deleteMessage({ id }: { id: string }): Promise<boolean>;
}

