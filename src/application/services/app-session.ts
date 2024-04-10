import { RdModule } from "@radts/reactjs";
import { BehaviorSubject } from "rxjs";
import { LoginStatus } from "../models/LoginStatus";
import { MessageModel } from "@/domain/chat";

export class AppSession extends RdModule {
  public key: symbol;
  public loginStatus: BehaviorSubject<LoginStatus>;
  public message: BehaviorSubject<MessageModel | null>;

  constructor() {
    super();
    this.key = Symbol("AppSession");
    this.loginStatus = new BehaviorSubject<LoginStatus>(LoginStatus.Idle);
    this.message = new BehaviorSubject<MessageModel>(null);
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
