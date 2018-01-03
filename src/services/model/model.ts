import { clone, mapAsync } from '@didie/utils'

import { ICoreConfig, ICoreContext, ICoreServices } from '../../core-interface'
import { CoreService } from '../../core-service'
import { ErrorBadRequest, ErrorNotFound } from '../../errors'
import { IDbCollection, IDbIndexOptions, IDbObject } from '../db/db-interface'
import { DbService } from '../db/db-service'
import { IValidationSpec, ValidationMode, Validator } from '../validation/validation-interface'

export interface ICoreModelFindOptions {
  sort?: object
  skip?: number
  limit?: number
  project?: object
}

export class Model<M extends IDbObject = any> {
  transform: (object: any) => Promise<M>
  transformParams: (params: Partial<M>) => Promise<any>

  protected collection: IDbCollection

  constructor(protected services: ICoreServices, protected name: string, protected validator?: Validator) {
    this.collection = this.services.db.collection(name)
    this.init()
  }

  init() {}

  createIndex(fieldOrSpec: string | any, options?: IDbIndexOptions) {
    this.collection.createIndex(fieldOrSpec, options)
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
    if (this.transform) objects = await mapAsync(objects, async o => await this.transform!(o))
    return objects
  }

  async findOne(id: string): Promise<M> {
    const objectID = this.services.db.objectID(id)
    let object = await this.collection.findOne({ _id: objectID })
    if (!object) throw new ErrorNotFound()
    if (this.transform) object = await this.transform(object)
    return object
  }

  async insert(values: object): Promise<M> {
    if (!this.validate(values, 'insert')) throw new ErrorBadRequest()
    if (this.transformParams) values = await this.transformParams(values)
    const res = await this.collection.insertOne(values)
    if (res.insertedCount !== 1) throw new Error('Could not insert object')
    let object = clone(values) as any
    object._id = res.insertedId
    if (this.transform) object = await this.transform(object)
    return object
  }

  async update(id: string, values: object): Promise<void> {
    if (!this.validate(values, 'update')) throw new ErrorBadRequest()
    if (this.transformParams) values = await this.transformParams(values)
    const objectID = this.services.db.objectID(id)
    const res = await this.collection.updateOne({ _id: objectID }, { $set: values })
    if (res.modifiedCount !== 1) throw new ErrorNotFound()
  }

  async delete(id: string): Promise<void> {
    const objectID = this.services.db.objectID(id)
    const res = await this.collection.deleteOne({ _id: objectID })
    if (res.deletedCount !== 1) throw new ErrorNotFound()
  }

  // Validation

  protected validate(values: any, mode: ValidationMode) {
    if (values._id) return false
    if (this.validator) return this.validator(values, mode)
    return true
  }

}
