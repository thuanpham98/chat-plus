import { RdModule } from "@radts/reactjs";
import axios from "axios";
import { onError, onRequest, onResponse } from "./intercepter";
import { ChatRepository, chatConfig } from "../repository/chat-repository";

export class AppRepository extends RdModule {
  public readonly key: symbol;

  public readonly chat: ChatRepository;
  constructor(basePath?: string) {
    super();
    chatConfig.basePath = basePath;
    this.key = Symbol("AppRepository");
    axios.interceptors.request.clear();
    axios.interceptors.response.clear();

    axios.defaults.timeout = 60 * 1000;
    axios.defaults.withCredentials = true;
    axios.interceptors.request.use(onRequest, onError);
    axios.interceptors.response.use(onResponse, onError);
    this.chat = new ChatRepository({ ...chatConfig });
  }

  public getName(): string {
    return this.key.description ?? "AppRepository";
  }
}
