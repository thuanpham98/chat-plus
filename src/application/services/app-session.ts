import { RdModule } from "@radts/reactjs";
import { BehaviorSubject, Subject } from "rxjs";
import { LoginStatus } from "../models/LoginStatus";
import { MessageModel } from "@/domain/chat";

export class AppSession extends RdModule {
  public key: symbol;
  public loginStatus: BehaviorSubject<LoginStatus>;
  public message: Subject<MessageModel>;

  constructor() {
    super();
    this.key = Symbol("AppSession");
    this.loginStatus = new BehaviorSubject<LoginStatus>(LoginStatus.Idle);
    this.message = new Subject<MessageModel>();
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
