import * as Koa from 'koa'
import * as Router from 'koa-router'
import { Collection, ObjectID } from 'mongodb'
import { crypto } from 'mz'
import { CoreService, ICoreContext } from '../../core-interface'
import { IDbCollection } from '../db-service/db-client'
import { makeRouter } from './auth-router'

export interface IAuthUser<Profile> {
  _id: ObjectID
  email: string
  role: string
  profile?: Profile
}

interface IAuthUserInternal<Profile> extends IAuthUser<Profile> {
  hash: string
  salt: string
}

export class AuthService<Profile = {}> extends CoreService {

  private collection: IDbCollection<IAuthUserInternal<Profile>>

  async init() {
    if (!this.config.auth) throw new Error('Missing auth config')
    this.collection = this.services.db.collection('auth')
    this.collection.createIndex({ email: 1 }, { unique: true })
  }

  async find(): Promise<Array<IAuthUser<Profile>>> {
    const users = await this.collection.find().toArray()
    return this.sanitize(users)
  }

  async findOne(id: string | ObjectID): Promise<IAuthUser<Profile>> {
    if (typeof id === 'string') id = new ObjectID(id)
    const user = await this.collection.findOne(id)
    return this.sanitizeOne(user)
  }

  async update(id: string | ObjectID, profile: Profile): Promise<void> {
    if (typeof id === 'string') id = new ObjectID(id)
    await this.collection.updateOne({ _id: id }, { profile })
  }

  async login(email: string, password: string): Promise<IAuthUser<Profile> | void> {
    const user = await this.collection.findOne({ email })
    const hash = await this.makeHash(user.salt, email, password)
    if (hash !== user.hash) return
    return this.sanitizeOne(user)
  }

  async signup(email: string, password: string, role: string, profile?: Profile): Promise<IAuthUser<Profile>> {
    const salt = await this.makeSalt()
    const hash = await this.makeHash(salt, email, password)
    const user: any = { email, salt, hash, role, profile }
    const res = await this.collection.insertOne(user)
    user._id = res.insertedId
    return this.sanitizeOne(user._id)
  }

  install(server: Koa): Router {
    return makeRouter(this.config, this.services)
  }

  private async makeSalt(): Promise<string> {
    const { saltlen, encoding } = this.config.auth!
    const buf = await crypto.randomBytes(saltlen || 512)
    return buf.toString(encoding || 'base64')
  }

  private async makeHash(salt: string, ...args: string[]): Promise<string> {
    const { iterations, keylen, digest, encoding } = this.config.auth!
    const password = args.join()
    const buf = await crypto.pbkdf2(password, salt, iterations || 10000, keylen || 512, digest || 'sha512')
    return buf.toString(encoding || 'base64')
  }

  private sanitize(users: Array<IAuthUserInternal<Profile>>): Array<IAuthUser<Profile>> {
    return users.map(user => this.sanitizeOne(user))
  }

  private sanitizeOne(user: IAuthUserInternal<Profile>): IAuthUser<Profile> {
    return {
      _id: user._id,
      email: user.email,
      profile: user.profile,
      role: user.role
    }
  }

}
