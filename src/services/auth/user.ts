import { crypto } from 'mz'

import { ICoreServices } from '../../core-interface'
import { ErrorBadRequest, ErrorUnauthorized } from '../../errors'
import { IDbObject, IDbObjectID } from '../db/db-interface'
import { ICoreModelFindOptions, Model } from '../model/model'
import { IValidationSpec, Validator } from '../validation/validation-interface'
import { IUser } from './auth-interface'

export class User<M extends IDbObject = IUser> extends Model<M> {

  static spec: IValidationSpec = {
    email: 'email',
    password: 'string',
    profile: 'any'
  }

  transform = async (user: any) => {
    delete user.salt
    delete user.hash
    return user
  }

  transformParams = async (user: Partial<M>) => {
    const object = await this.transform(user) as any
    if (object.password !== undefined) {
      object.salt = await this.services.auth.makeSalt()
      object.hash = await this.services.auth.makeHash(object.salt, object.password)
      delete object.password
    }
    return object
  }

  init() {
    this.createIndex('email', { unique: true })
  }

  async authenticate(email: string, password: string): Promise<M> {
    const user = await this.collection.findOne({ email })
    if (!user) throw new ErrorUnauthorized()
    if (!user.verified) throw new ErrorUnauthorized()
    const hash = await this.services.auth.makeHash(user.salt, password)
    if (hash !== user.hash) throw new ErrorUnauthorized()
    return await this.transform(user)
  }

  async verify(id: string): Promise<void> {
    const userId = this.services.db.objectID(id)
    const res = await this.collection.updateOne({ _id: userId }, { $set: { verified: true } })
    if (res.modifiedCount !== 1) throw new Error('Could not verify user')
  }

  async serialize(user: M): Promise<string> {
    return user._id.toString()
  }

  async unserialize(id: string): Promise<M> {
    return this.findOne(id)
  }

}
