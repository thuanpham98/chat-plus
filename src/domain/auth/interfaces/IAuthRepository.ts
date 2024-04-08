import { AccessTokenModel } from "../models/AccessTokenModel";

export interface IAuthRepository {
  login({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<AccessTokenModel>;
}

