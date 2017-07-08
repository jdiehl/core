import * as Koa from 'koa'
import * as Router from 'koa-router'
import { Collection, ObjectID } from 'mongodb'
import { crypto } from 'mz'

import { CoreService } from '../../core-service'
import { IDbCollection } from '../db/db-interface'
import { IUser, IUserInternal } from './auth-interface'
import { makeRouter } from './auth-router'

export class AuthService<Profile = {}> extends CoreService {

  private collection: IDbCollection<IUserInternal<Profile>>

  async find(): Promise<Array<IUser<Profile>>> {
    const users = await this.collection.find().toArray()
    return this.sanitize(users)
  }

  async findOne(id: string | ObjectID): Promise<IUser<Profile>> {
    if (typeof id === 'string') id = new ObjectID(id)
    const user = await this.collection.findOne(id)
    return this.sanitizeOne(user)
  }

  async update(id: string | ObjectID, profile: Profile): Promise<void> {
    if (typeof id === 'string') id = new ObjectID(id)
    await this.collection.updateOne({ _id: id }, { $set: { profile } })
  }

  async login(email: string, password: string): Promise<IUser<Profile> | void> {
    const user = await this.collection.findOne({ email })
    const hash = await this.makeHash(user.salt, this.config.auth!.secret, password)
    if (hash !== user.hash) return
    return this.sanitizeOne(user)
  }

  async signup(email: string, password: string, role: string, profile?: Profile): Promise<IUser<Profile>> {
    const salt = await this.makeSalt()
    const hash = await this.makeHash(salt, this.config.auth!.secret, password)
    const user: any = { email, salt, hash, role, profile }
    const res = await this.collection.insertOne(user)
    user._id = res.insertedId
    return this.sanitizeOne(user)
  }

  // CoreService

  async init() {
    if (!this.config.auth) return
    this.collection = this.services.db.collection(this.config.auth.collection || 'auth')
    this.collection.createIndex('email', { unique: true })
  }

  install(server: Koa): Router {
    return makeRouter(this.config, this.services)
  }

  // private

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

  private sanitize(users: Array<IUserInternal<Profile>>): Array<IUser<Profile>> {
    return users.map(user => this.sanitizeOne(user))
  }

  private sanitizeOne(user: IUserInternal<Profile>): IUser<Profile> {
    return {
      _id: user._id,
      email: user.email,
      profile: user.profile,
      role: user.role
    }
  }

}
