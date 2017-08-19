import { clone, extend, mapAsync } from '@-)/utils'

import { ICoreConfig, ICoreContext, ICoreServices } from './core-interface'
import { CoreService } from './core-service'
import { ErrorNotFound } from './errors'
import { IDbCollection, IDbObject } from './services/db/db-interface'
import { Delete, Get, Post, Put } from './services/router/router-decorators'
import { IValidationSpec } from './services/validation/validation-interface'

export interface ICoreModelFindOptions {
  sort?: object
  skip?: number
  limit?: number
  project?: object
}

export abstract class CoreModel<
  Int extends IDbObject = any,
  Ext extends IDbObject = Int,
  C extends ICoreConfig = ICoreConfig,
  S extends ICoreServices = ICoreServices
> extends CoreService<C, S> {

  spec?: IValidationSpec
  abstract collectionName: string
  protected collection: IDbCollection

  async find(query?: object, options?: ICoreModelFindOptions): Promise <Ext[]> {
    if (this.beforeFind) query = await this.beforeFind(query, options)
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

  async findOne(id: string): Promise < Ext > {
    if (this.beforeFindOne) await this.beforeFindOne(id)
    const objectID = this.services.db.objectID(id)
    let object = await this.collection.findOne({ _id: objectID })
    if (!object) throw new ErrorNotFound()
    if (this.afterFindOne) object = await this.afterFindOne(object)
    if (this.transform) object = await this.transform(object)
    return object
  }

  async insert(values: object): Promise<Ext > {
    if (!this.validate(values, false)) throw new Error('Invalid object')
    if (this.beforeInsert) values = await this.beforeInsert(values)
    const res = await this.collection.insertOne(values)
    if (res.insertedCount !== 1) throw new Error('Could not insert object')
    let object = clone(values) as any
    object._id = res.insertedId
    if (this.afterInsert) object = await this.afterInsert(object)
    if (this.transform) object = await this.transform(object)
    return object
  }

  async update(id: string, values: object): Promise<void > {
    if (!this.validate(values, true)) throw new Error('Invalid object')
    if (this.beforeUpdate) values = await this.beforeUpdate(id, values)
    const objectID = this.services.db.objectID(id)
    const res = await this.collection.updateOne({ _id: objectID }, { $set: values })
    if (res.modifiedCount !== 1) throw new Error('Could not update object')
    if (this.afterUpdate) await this.afterUpdate(id, values)
  }

  async delete(id: string): Promise<void > {
    if (this.beforeDelete) await this.beforeDelete(id)
    const objectID = this.services.db.objectID(id)
    const res = await this.collection.deleteOne({ _id: objectID })
    if (res.deletedCount !== 1) throw new Error('Could not delete object')
    if (this.afterDelete) await this.afterDelete(id)
  }

  // CoreService

  async init() {
    this.collection = this.services.db.collection<Int>(this.collectionName)

    // Routes must be created here to allow subclassing
    Get('/', ['query'])(this, 'find')
    Get('/:id', ['params.id'])(this, 'findOne')
    Post('/', ['request.body'])(this, 'insert')
    Put('/:id', ['params.id', 'request.body'])(this, 'update')
    Delete('/:id', ['params.id'])(this, 'delete')
    this.router!.prefix(this.routerPrefix)
  }

  // Validation

  protected validate(values: any, allowPartial: boolean) {
    if (values._id) return false
    if (this.spec) return this.services.validation.validate(this.spec, values, allowPartial)
    return true
  }

  // Router configuration

  protected get routerPrefix(): string {
    return `/${this.collectionName}`
  }

  // Hooks

  protected async afterFindOne ?(object: Int): Promise<Int>
  protected async afterFind ?(objects: Int[], query?: object, options?: ICoreModelFindOptions): Promise<Int[]>
  protected async afterInsert ?(object: Int): Promise<Int>
  protected async afterUpdate ?(id: string, values: object): Promise<void>
  protected async afterDelete ?(id: string): Promise<void>
  protected async beforeFindOne ?(id: string): Promise<void>
  protected async beforeFind ?(query ?: object, options ?: ICoreModelFindOptions): Promise < object >
  protected async beforeInsert ?(values: object): Promise<object>
  protected async beforeUpdate ?(id: string, values: object): Promise<object>
  protected async beforeDelete ?(id: string): Promise<void>
  protected async transform ?(object: Int): Promise<Ext>

}
