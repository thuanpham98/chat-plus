import { RdModule } from "@radts/reactjs";
import { BehaviorSubject } from "rxjs";
import { LoginStatus } from "../models/LoginStatus";

export class AppSession extends RdModule {
  public key: symbol;
  public loginStatus: BehaviorSubject<LoginStatus>;

  constructor() {
    super();
    this.key = Symbol("AppSession");
    this.loginStatus = new BehaviorSubject<LoginStatus>(LoginStatus.Idle);
  }
  getName(): string {
    return this.key.description ?? "AppSession";
  }

  public getClassName(): string {
    return "AppSession";
  }

  public closeAll() {
    this.loginStatus.complete();
  }
}
