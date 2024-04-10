export interface IMessageRepository {
  sendToFriend({ data }: { data: Uint8Array }): Promise<boolean>;
}

