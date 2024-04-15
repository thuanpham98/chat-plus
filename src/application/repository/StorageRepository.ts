import { IStorageRepository } from "@/domain/chat";
import { ChatHttpClient } from "./chat-repository";
import { ErrorApi } from "../models/ErrorCustomModel";

export class StorageRepository implements IStorageRepository {
  private _c: ChatHttpClient;

  constructor(config?: ChatHttpClient) {
    this._c = config;
  }

  public async downloadFile(name: string): Promise<File> {
    const resp = await this._c.storage.downloadFile({
      name: name,
    });
    if (resp) {
      return resp;
    } else {
      throw new ErrorApi({
        code: resp.data.code,
        message: resp.data.message,
        cause: "download file",
      });
    }
  }

  public async uploadFile(file: File): Promise<string> {
    const resp = await this._c.storage.uploadFile({
      file: file,
    });
    if (resp?.data?.code === 0) {
      return resp?.data?.data ?? "";
    } else {
      throw new ErrorApi({
        code: resp.data.code,
        message: resp.data.message,
        cause: "upload file",
      });
    }
  }
}

