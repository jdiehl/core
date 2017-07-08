import { crypto } from 'mz'

import { CoreModel } from '../../core-model'
import { IAuthToken, IUser, IUserInternal } from './auth-interface'

export class AuthService<Profile = {}> extends CoreModel<IUserInternal<Profile>, IUser<Profile>> {
  protected collectionName: string

  async login(email: string, password: string): Promise<IUser<Profile> | void> {
    const user = await this.collection.findOne({ email })
    const hash = await this.makeHash(user.salt, this.config.auth!.secret, password)
    if (hash !== user.hash) throw new Error('Invalid Login')
    return this.transform(user)
  }

  async verify(token: string): Promise<void> {
    const info = await this.services.token.use<IAuthToken>(token)
    if (!info || info.type !== 'signup') throw new Error('Invalid token')
  }

  // CoreService

  async init() {
    if (!this.config.auth) return
    this.collectionName = this.config.auth.collection || 'auth'
    await super.init()
    this.collection.createIndex('email', { unique: true })
  }

  // CoreModel

  protected async beforeUpdate(id: string, profile: any): Promise<any> {
    return { profile }
  }

  protected async beforeInsert(obj: any): Promise<any> {
    const { password, email, role, profile } = obj
    const salt = await this.makeSalt()
    const hash = await this.makeHash(salt, this.config.auth!.secret, password)
    return { email, salt, hash, role, profile }
  }

  protected async afterInsert(user: IUserInternal<Profile>): Promise<IUserInternal<Profile>> {
    const reference: IAuthToken = { type: 'signup', user: user._id.toString() }
    const token = await this.services.token.create(reference, { useCount: 1, validFor: '1d' })
    const subject = 'Please verify your email address'
    this.services.email.sendTemplate('signup', { user, token }, { subject, to: user.email })
    return user
  }

  protected async transform(user: IUserInternal<Profile>): Promise<IUser<Profile>> {
    const { _id, email, profile, role } = user
    return { _id, email, profile, role }
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

}
