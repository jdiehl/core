import { clone, extend, mapAsync } from '@-)/utils'

import { CoreService } from './core-service'
import { IDbCollection, IDbObject } from './services/db/db-interface'

export interface ICoreModelFindOptions {
  sort?: object
  skip?: number
  limit?: number
  project?: object
}

export abstract class CoreModel<T extends IDbObject = any> extends CoreService {
  abstract collectionName: string
  protected collection: IDbCollection

  async afterFindOne?(object: T): Promise<T>
  async afterFind?(objects: T[], query?: object, options?: ICoreModelFindOptions): Promise<T[]>
  async afterInsert?(object: T): Promise<T>
  async afterUpdate?(id: string, values: Partial<T>): Promise<void>
  async afterDelete?(id: string): Promise<void>
  async beforeFindOne?(id: string): Promise<void>
  async beforeFind?(query?: object, options?: ICoreModelFindOptions): Promise<void>
  async beforeInsert?(values: Partial<T>): Promise<void>
  async beforeUpdate?(id: string, values: Partial<T>): Promise<void>
  async beforeDelete?(id: string): Promise<void>
  async transform?(object: T): Promise<T>

  async findOne(id: string): Promise<T> {
    if (this.beforeFindOne) await this.beforeFindOne(id)
    const objectID = this.services.db.objectID(id)
    let object = await this.collection.findOne({ _id: objectID })
    if (this.afterFindOne) object = await this.afterFindOne(object)
    if (this.transform) object = await this.transform(object)
    return object
  }

  async find(query?: object, options?: ICoreModelFindOptions): Promise<T[]> {
    if (this.beforeFind) await this.beforeFind(query, options)
    const cursor = this.collection.find(query)
    if (options) {
      if (options.sort) cursor.sort(options.sort)
      if (options.skip) cursor.skip(options.skip)
      if (options.limit) cursor.limit(options.limit)
      if (options.project) cursor.project(options.project)
    }
    let objects = await cursor.toArray()
    if (this.afterFind) objects = await this.afterFind(objects)
    if (this.transform) objects = await mapAsync(objects, async o => this.transform!(o))
    return objects
  }

  async insert(values: Partial<T>): Promise<T> {
    if (this.beforeInsert) await this.beforeInsert(values)
    const res = await this.collection.insertOne(values)
    if (res.insertedCount !== 1) throw new Error('Could not insert object')
    let object = clone(values) as T
    object._id = res.insertedId
    if (this.afterInsert) object = await this.afterInsert(object)
    if (this.transform) object = await this.transform(object)
    return object
  }

  async update(id: string, values: Partial<T>): Promise<void> {
    if (this.beforeUpdate) await this.beforeUpdate(id, values)
    const objectID = this.services.db.objectID(id)
    const res = await this.collection.updateOne({ _id: objectID }, { $set: values })
    if (res.modifiedCount !== 1) throw new Error('Could not update object')
    if (this.afterUpdate) await this.afterUpdate(id, values)
  }

  async delete(id: string): Promise<void> {
    if (this.beforeDelete) await this.beforeDelete(id)
    const objectID = this.services.db.objectID(id)
    const res = await this.collection.deleteOne({ _id: objectID })
    if (res.deletedCount !== 1) throw new Error('Could not delete object')
    if (this.afterDelete) await this.afterDelete(id)
  }

  // CoreService

  async init() {
    this.collection = this.services.db.collection<T>(this.collectionName)
  }

}
