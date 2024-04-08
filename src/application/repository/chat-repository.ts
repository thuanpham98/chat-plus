import { IAuthRepository } from "@/domain/auth";
import { AuthControllerApi } from "@/infrastructure/chat-api/AuthControllerApi";
import { ConfigurationApiParameters } from "@/infrastructure/chat-api/config";
import { AuthRepository } from "./AuthRepository";


export const chatConfig: ConfigurationApiParameters = {};

export class ChatHttpClient {
  public readonly auth: AuthControllerApi;
  // public readonly user: UserControllerApi;

  constructor(params: ConfigurationApiParameters) {
    this.auth = new AuthControllerApi(params);
  }
}

export class ChatRepository {
  public chatHttpClient: ChatHttpClient;
  public readonly auth: IAuthRepository;
  // public readonly user: IUserRepository;

  constructor(params: ConfigurationApiParameters) {
    this.chatHttpClient = new ChatHttpClient(params);
    this.auth = new AuthRepository(this.chatHttpClient);
    // this.user = new UserRepository(this.losHttpClient);
  }
}
