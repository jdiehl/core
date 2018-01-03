import { IDbObject, IDbObjectID } from '../db/db-interface'

export interface IAuthConfig {
  prefix?: string
  verifyEmail?: boolean
  secret: string
  collection?: string
  encoding?: string
  digest?: string
  iterations?: number
  keylen?: number
  saltlen?: number
  }

export interface IAuthToken {
  type: 'signup'
  user: string
}

export interface IUser<Profile = any> extends IDbObject {
  _id: IDbObjectID
  email: string
  password?: string
  profile: Profile
  verified?: boolean
}
