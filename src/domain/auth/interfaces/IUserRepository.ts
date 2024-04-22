import { UserModel } from "../models/UserModel";

export interface IUserRepository {
  userInfo(): Promise<UserModel>;
  listFriends(): Promise<UserModel[]>;
}
