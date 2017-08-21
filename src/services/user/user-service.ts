import { crypto } from 'mz'

import { ICoreContext } from '../../core-interface'
import { CoreModel } from '../../core-model'
import { ErrorUnauthorized } from '../../errors'
import { IUser, IUserInternal } from './user-interface'

export class UserService<Profile = {}> extends CoreModel<IUser<Profile>> {
  collectionName: string

  async authenticate(email: string, password: string): Promise<IUser<Profile>> {
    const user = await this.collection.findOne({ email })
    if (!user) throw new ErrorUnauthorized()
    if (!user.verified) throw new ErrorUnauthorized()
    const hash = await this.makeHash(user.salt, this.config.user!.secret, password)
    if (hash !== user.hash) throw new ErrorUnauthorized()
    return this.transform(user)
  }

  async verify(id: string): Promise<void> {
    const userId = this.services.db.objectID(id)
    const res = await this.collection.updateOne({ _id: userId }, { $set: { verified: true } })
    if (res.modifiedCount !== 1) throw new Error('Could not verify user')
  }

  async serialize(user: IUser): Promise<string> {
    return user._id.toString()
  }

  async unserialize(id: string): Promise<IUser> {
    return this.findOne(id)
  }

  // CoreService

  // require admin user for all methods
  async before(context: ICoreContext, key: keyof UserService, params: any): Promise<void> {
    if (!context.user || context.user.role !== 'admin') {
      throw new ErrorUnauthorized()
    }
  }

  async init() {
    this.collectionName = this.config.user && this.config.user.collection || 'user'
    await super.init()
    this.collection.createIndex(['email'], { unique: true })
  }

  // CoreModel

  async insert(values: object): Promise<IUser<Profile>> {
    const { password, email, role, verified, profile } = values as any
    const salt = await this.makeSalt()
    const hash = await this.makeHash(salt, this.config.user!.secret, password)
    const user: any = { email, salt, hash, role }
    if (profile) user.profile = profile
    return super.insert(user)
  }

  async update(id: string, values: object): Promise<void> {
    const { password, email, role, verified, profile } = values as any
    const user: Partial<IUserInternal> = {}
    if (password) {
      user.salt = await this.makeSalt()
      user.hash = await this.makeHash(user.salt, this.config.user!.secret, password)
    }
    if (email) user.email = email
    if (role) user.role = role
    if (verified !== undefined) user.verified = verified
    if (profile !== undefined) user.profile = profile
    return super.update(id, user)
  }

  protected transform(userInternal: IUserInternal<Profile>): IUser<Profile> {
    const { _id, email, profile, role } = userInternal
    const user: IUser = { _id, email, role }
    if (profile) user.profile = profile
    return user
  }

  // protected

  protected async makeSalt(): Promise<string> {
    const { saltlen, encoding } = this.config.user!
    const buf = await crypto.randomBytes(saltlen || 512)
    return buf.toString(encoding || 'base64')
  }

  protected async makeHash(salt: string, ...args: string[]): Promise<string> {
    const { iterations, keylen, digest, encoding } = this.config.user!
    const password = args.join()
    const buf = await crypto.pbkdf2(password, salt, iterations || 10000, keylen || 512, digest || 'sha512')
    return buf.toString(encoding || 'base64')
  }

}
