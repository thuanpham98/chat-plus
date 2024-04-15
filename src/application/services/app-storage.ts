import { RdLocalStorage, RdModule, RdSessionStorage } from "@radts/reactjs";

enum KeysStorage {
  accessToken = "accessToken",
  refreshToken = "refreshToken",
  isLogin = "isLogin",
  countRefreshToken = "countRefreshToken",
}

export class AppStorage extends RdModule {
  private _localStore: RdLocalStorage;
  private _sessionStore: RdSessionStorage;
  private _packageName = "__CHATTING__";
  public readonly key: symbol;
  constructor() {
    super();
    this._localStore = new RdLocalStorage();
    this._sessionStore = new RdSessionStorage();
    this.key = Symbol("AppStorage");
  }

  getName(): string {
    return this.key.description ?? "AppStorage";
  }

  _getKey(key: string): string {
    return `${this._packageName}${key}`;
  }

  // access token
  public get accessToken(): string {
    if (process.env.ENVIORNMENT_TYPE.toString() === "web") {
      return (
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("Authorization="))
          ?.split("=")[1] ?? ""
      );
    } else {
      const { ipcRenderer } = window.require("electron");
      const ret = ipcRenderer.sendSync("[coockie][renderer][to][main]", {
        type: "get",
        key: "Authorization",
        value: null,
      });
      return ret ? ret : "";
    }
  }

  public set accessToken(v: string) {
    if (process.env.ENVIORNMENT_TYPE.toString() === "web") {
      if (v.length === 0) {
        document.cookie =
          "Authorization" + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } else {
        document.cookie = `Authorization=${v}`;
      }
    } else if (process.env.ENVIORNMENT_TYPE.toString() === "electron") {
      const { ipcRenderer } = window.require("electron");
      ipcRenderer.send("[coockie][renderer][to][main]", {
        type: "set",
        key: "Authorization",
        value: v,
      });
    }
  }

  // refresh token
  public get refreshToken(): string {
    return (
      this._sessionStore?.getItem({
        key: `${this._getKey(KeysStorage.refreshToken)}`,
      }) ?? ""
    );
  }

  public set refreshToken(v: string) {
    this._sessionStore?.setItem({
      key: `${this._getKey(KeysStorage.refreshToken)}`,
      value: v,
    });
  }

  // isLogin
  public get isLogin(): boolean {
    return (
      (this._sessionStore?.getItem({
        key: `${this._getKey(KeysStorage.isLogin)}`,
      }) ?? "") === "true"
    );
  }

  public set isLogin(v: boolean) {
    this._sessionStore?.setItem({
      key: `${this._getKey(KeysStorage.isLogin)}`,
      value: v.toString(),
    });
  }

  // countRefreshToken
  public get countRefreshToken(): number {
    if (
      this._sessionStore?.getItem({
        key: `${this._getKey(KeysStorage.countRefreshToken)}`,
      }) === ""
    ) {
      return 0;
    }
    return parseInt(
      this._sessionStore?.getItem({
        key: `${this._getKey(KeysStorage.countRefreshToken)}`,
      }),
    );
  }

  public set countRefreshToken(v: number) {
    this._sessionStore?.setItem({
      key: `${this._getKey(KeysStorage.countRefreshToken)}`,
      value: v.toString(),
    });
  }

  public clearLocalStorage() {
    this._localStore?.clearStorage();
  }

  public clearSessionStorage() {
    this._sessionStore?.clearStorage();
  }

  // clear all local data
  public clearAll() {
    this.clearSessionStorage();
    this.clearLocalStorage();
  }
}
