import { IAuthRepository, IUserRepository } from "@/domain/auth";
import { AuthControllerApi } from "@/infrastructure/chat-api/AuthControllerApi";
import { ConfigurationApiParameters } from "@/infrastructure/chat-api/config";
import { AuthRepository } from "./AuthRepository";
import { UserControllerApi } from "@/infrastructure/chat-api/UserControllerApi";
import { UserRepository } from "./UserRepository";
import { MessageControllerApi } from "@/infrastructure/chat-api/MessageControllerApi";
import { IMessageRepository, IStorageRepository } from "@/domain/chat";
import { MessageRepository } from "./MessageRepository";
import { StorageControllerApi } from "@/infrastructure/chat-api/StorageControllerApi";
import { StorageRepository } from "./StorageRepository";

export const chatConfig: ConfigurationApiParameters = {};

export class ChatHttpClient {
  public readonly auth: AuthControllerApi;
  public readonly user: UserControllerApi;
  public readonly message: MessageControllerApi;
  public readonly storage: StorageControllerApi;

  constructor(params: ConfigurationApiParameters) {
    this.auth = new AuthControllerApi(params);
    this.user = new UserControllerApi(params);
    this.message = new MessageControllerApi(params);
    this.storage = new StorageControllerApi(params);
  }
}

export class ChatRepository {
  public chatHttpClient: ChatHttpClient;
  public readonly auth: IAuthRepository;
  public readonly user: IUserRepository;
  public readonly message: IMessageRepository;
  public readonly storage: IStorageRepository;

  constructor(params: ConfigurationApiParameters) {
    this.chatHttpClient = new ChatHttpClient(params);
    this.auth = new AuthRepository(this.chatHttpClient);
    this.user = new UserRepository(this.chatHttpClient);
    this.message = new MessageRepository(this.chatHttpClient);
    this.storage = new StorageRepository(this.chatHttpClient);
  }
}
