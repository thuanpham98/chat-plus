import axios from "axios";
import { ConfigurationApiParameters } from "./config";

export class StorageControllerApi {
  private _c: ConfigurationApiParameters;

  constructor(config?: ConfigurationApiParameters) {
    this._c = config;
  }

  public async uploadFile({ file }: { file: File }) {
    const formData = new FormData();
    formData.append("file", file);
    const ret = await axios({
      method: "post",
      baseURL: this._c.basePath,
      url: `/api/v1/storage/upload`,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return ret.data;
  }

  public async downloadFile({ name }: { name: string }) {
    const ret = await axios({
      method: "post",
      baseURL: this._c.basePath,
      url: `/api/v1/storage/download`,
      data: {
        file_name: name,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    return ret.data;
  }
}

