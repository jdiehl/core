import { IDbObject } from '../db/db-interface'

export interface IUserConfig {
  secret: string
  collection?: string
  encoding?: string
  digest?: string
  iterations?: number
  keylen?: number
  saltlen?: number
}

export interface IUser<Profile = any> extends IDbObject {
  email: string
  role: string
  profile?: Profile
}

export interface IUserInternal<Profile = any> extends IUser<Profile> {
  hash: string
  salt: string
  verified?: boolean
}
