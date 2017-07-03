import { IDbObject } from '../db-service/db-interface'

export interface IUser<Profile = any> extends IDbObject {
  email: string
  role: string
  profile?: Profile
}

export interface IUserInternal<Profile = any> extends IUser<Profile> {
  hash: string
  salt: string
}
