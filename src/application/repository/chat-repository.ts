import { IAuthRepository, IUserRepository } from "@/domain/auth";
import { AuthControllerApi } from "@/infrastructure/chat-api/AuthControllerApi";
import { ConfigurationApiParameters } from "@/infrastructure/chat-api/config";
import { AuthRepository } from "./AuthRepository";
import { UserControllerApi } from "@/infrastructure/chat-api/UserControllerApi";
import { UserRepository } from "./UserRepository";
import { MessageControllerApi } from "@/infrastructure/chat-api/MessageControllerApi";
import { IMessageRepository } from "@/domain/chat";
import { MessageRepository } from "./MessageRepository";

export const chatConfig: ConfigurationApiParameters = {};

export class ChatHttpClient {
  public readonly auth: AuthControllerApi;
  public readonly user: UserControllerApi;
  public readonly message: MessageControllerApi;

  constructor(params: ConfigurationApiParameters) {
    this.auth = new AuthControllerApi(params);
    this.user = new UserControllerApi(params);
    this.message = new MessageControllerApi(params);
  }
}

export class ChatRepository {
  public chatHttpClient: ChatHttpClient;
  public readonly auth: IAuthRepository;
  public readonly user: IUserRepository;
  public readonly message: IMessageRepository;

  constructor(params: ConfigurationApiParameters) {
    this.chatHttpClient = new ChatHttpClient(params);
    this.auth = new AuthRepository(this.chatHttpClient);
    this.user = new UserRepository(this.chatHttpClient);
    this.message = new MessageRepository(this.chatHttpClient);
  }
}
