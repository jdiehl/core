import { clone } from '@didie/utils'

import { ICoreConfig, ICoreContext, ICoreServices } from '../../core-interface'
import { CoreService } from '../../core-service'
import { ErrorBadRequest, ErrorNotFound } from '../../errors'
import { IDbCollection, IDbObject } from '../db/db-interface'
import { DbService } from '../db/db-service'
import { IValidationSpec, Validator } from '../validation/validation-interface'

export interface ICoreModelFindOptions {
  sort?: object
  skip?: number
  limit?: number
  project?: object
}

export class Model<M extends IDbObject = any> {
  collection: IDbCollection

  constructor(public db: DbService, public name: string, public validator?: Validator) {
    this.collection = this.db.collection(name)
  }

  async find(query?: object, options?: ICoreModelFindOptions): Promise<M[]> {
    const cursor = this.collection.find(query)
    if (options) {
      if (options.sort) cursor.sort(options.sort)
      if (options.skip) cursor.skip(options.skip)
      if (options.limit) cursor.limit(options.limit)
      if (options.project) cursor.project(options.project)
    }
    let objects = await cursor.toArray()
    if (this.transform) objects = objects.map(o => this.transform!(o))
    return objects
  }

  async findOne(id: string): Promise<Model> {
    const objectID = this.db.objectID(id)
    let object = await this.collection.findOne({ _id: objectID })
    if (!object) throw new ErrorNotFound()
    if (this.transform) object = await this.transform(object)
    return object
  }

  async insert(values: object): Promise<Model> {
    if (!this.validate(values, false)) throw new ErrorBadRequest()
    const res = await this.collection.insertOne(values)
    if (res.insertedCount !== 1) throw new Error('Could not insert object')
    let object = clone(values) as any
    object._id = res.insertedId
    if (this.transform) object = await this.transform(object)
    return object
  }

  async update(id: string, values: object): Promise<void> {
    if (!this.validate(values, true)) throw new ErrorBadRequest()
    const objectID = this.db.objectID(id)
    const res = await this.collection.updateOne({ _id: objectID }, { $set: values })
    if (res.modifiedCount !== 1) throw new ErrorNotFound()
  }

  async delete(id: string): Promise<void> {
    const objectID = this.db.objectID(id)
    const res = await this.collection.deleteOne({ _id: objectID })
    if (res.deletedCount !== 1) throw new ErrorNotFound()
  }

  // Validation

  protected validate(values: any, allowPartial: boolean) {
    if (values._id) return false
    if (this.validator) return this.validator(values, allowPartial)
    return true
  }

  // Transform

  protected transform?(object: Model): any {
    return object
  }

}
