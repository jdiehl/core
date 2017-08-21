import { clone } from '@-)/utils'

import { ICoreConfig, ICoreContext, ICoreServices } from './core-interface'
import { CoreService } from './core-service'
import { ErrorBadRequest, ErrorNotFound } from './errors'
import { IDbCollection, IDbObject } from './services/db/db-interface'
import { Delete, Get, Post, Put } from './services/router/router-decorators'
import { IValidationSpec } from './services/validation/validation-interface'

export interface ICoreModelFindOptions {
  sort?: object
  skip?: number
  limit?: number
  project?: object
}

export abstract class CoreModel<Model extends IDbObject = any> extends CoreService {

  spec?: IValidationSpec
  abstract collectionName: string
  protected collection: IDbCollection

  async find(query?: object, options?: ICoreModelFindOptions): Promise<Model[]> {
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
    const objectID = this.services.db.objectID(id)
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
    const objectID = this.services.db.objectID(id)
    const res = await this.collection.updateOne({ _id: objectID }, { $set: values })
    if (res.modifiedCount !== 1) throw new ErrorNotFound()
  }

  async delete(id: string): Promise<void> {
    const objectID = this.services.db.objectID(id)
    const res = await this.collection.deleteOne({ _id: objectID })
    if (res.deletedCount !== 1) throw new ErrorNotFound()
  }

  // CoreService

  async init() {
    this.collection = this.services.db.collection<Model>(this.collectionName)

    // Routes must be created here to allow subclassing
    Post('/', ['request.body'])(this, 'insert')
    this.router!.get('/', async (context) => {
      // TODO: compute last-modified
      const modified = new Date() as any
      if (context.header['if-modified-since']) {
        const cache = new Date(context.header['if-modified-since'])
        if (modified <= cache) return context.status = 304
      }
      context.set('last-modified', modified.toGMTString())
      context.set('cache-control', `max-age=0`)
      context.body = await this.find(context.query)
    })
    // Get('/', ['query'])(this, 'find')
    Get('/:id', ['params.id'])(this, 'findOne')
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

  // Transform

  protected transform?(object: Model): any

}
