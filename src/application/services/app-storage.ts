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
  private _packageName: string = "__CHATTING__";
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
    return (
      this._sessionStore?.getItem({
        key: `${this._getKey(KeysStorage.accessToken)}`,
      }) ?? ""
    );
  }

  public set accessToken(v: string) {
    this._sessionStore?.setItem({
      key: `${this._getKey(KeysStorage.accessToken)}`,
      value: v,
    });
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
      })
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
