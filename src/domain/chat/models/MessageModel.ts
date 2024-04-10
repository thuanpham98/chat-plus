import { GroupModel } from "./GroupModel";

export enum MessageModelType {
  TEXT = 0,
  IMAGE = 1,
  FILE = 2,
}

export type MessageModel = {
  id: string;
  sender: string;
  receiver: string;
  Group?: GroupModel;
  createAt: string;
  content: string;
  type: MessageModelType;
};

