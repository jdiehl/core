import { each, makeIndex } from '@didie/utils'
import * as Router from 'koa-router'
import { ObjectID } from 'mongodb'

import { CoreApp, CoreService, coreServices, ICoreConfig, ICoreServices, Model } from '../../src'
import { IDbCollection, IDbCursor } from '../../src/services/db/db-interface'
import { mockClear, MockifiedObject, MockifiedObjects,
  mockify, mockifyClasses, mockifyMany, mockResolve } from './mockify'

export type MockCollection = MockifiedObject<IDbCollection>
export type MockCursor = MockifiedObject<IDbCursor>
export type MockServices = MockifiedObjects<ICoreServices> & { resetHistory: () => void }
export type MockModel = MockifiedObject<Model>
export type MockRouter = MockifiedObject<Router>

export interface IMock {
  app: CoreApp
  collection: MockCollection
  cursor: MockCursor
  model: MockModel
  services: MockServices
  router: MockRouter
  reset: () => void
}

function mockCursor(): MockCursor {
  const cursor: Partial<MockCursor> = {}
  cursor.count = jest.fn(mockResolve())
  cursor.filter = jest.fn().mockReturnValue(cursor)
  cursor.limit = jest.fn().mockReturnValue(cursor)
  cursor.map = jest.fn().mockReturnValue(cursor)
  cursor.next = jest.fn(mockResolve())
  cursor.project = jest.fn().mockReturnValue(cursor)
  cursor.skip = jest.fn().mockReturnValue(cursor)
  cursor.sort = jest.fn().mockReturnValue(cursor)
  cursor.toArray = jest.fn(mockResolve([{ _id: 'id1' }, { _id: 'id2' }]))
  return cursor as MockCursor
}

function mockCollection(cursor: MockCursor): MockCollection {
  const collection: Partial<MockCollection> = {}
  collection.count = jest.fn(mockResolve())
  collection.createIndex = jest.fn(mockResolve())
  collection.deleteMany = jest.fn(mockResolve({ deletedCount: 2 }))
  collection.deleteOne = jest.fn(mockResolve({ deletedCount: 1 }))
  collection.drop = jest.fn(mockResolve())
  collection.dropIndex = jest.fn(mockResolve())
  collection.find = jest.fn().mockReturnValue(cursor)
  collection.findOne = jest.fn(mockResolve({ _id: 'id1' }))
  collection.insertMany = jest.fn(mockResolve({ insertedCount: 2, insertedIds: ['id1', 'id2'] }))
  collection.insertOne = jest.fn(mockResolve({ insertedCount: 1, insertedId: 'id1' }))
  collection.updateMany = jest.fn(mockResolve({ modifiedCount: 2 }))
  collection.updateOne = jest.fn(mockResolve({ modifiedCount: 1 }))
  return collection as MockCollection
}

function mockModel(): MockModel {
  const model: Partial<MockModel> = {}
  model.find = jest.fn(mockResolve([{ _id: 'id1' }, { _id: 'id2' }]))
  model.findOne = jest.fn(mockResolve({ _id: 'id1' }))
  model.insert = jest.fn(mockResolve({ _id: 'id1' }))
  model.update = jest.fn(mockResolve())
  model.delete = jest.fn(mockResolve())
  return model as MockModel
}

function mockRouter(): MockRouter {
  const router: Partial<MockRouter> = {}
  router.get = jest.fn()
  router.post = jest.fn()
  router.put = jest.fn()
  router.delete = jest.fn()
  router.use = jest.fn()
  router.allowedMethods = jest.fn()
  router.routes = jest.fn()
  return router as MockRouter
}

function mockServices(app: CoreApp, collection: MockCollection, model: MockModel,
                      router: MockRouter, preserve: string[]): MockServices {
  const services = mockifyMany(app.services, name => preserve.indexOf(name) < 0,
    m => m.mockImplementation(mockResolve()))
  if (preserve.indexOf('db') < 0) {
    services.db.collection.mockReturnValue(collection)
    services.db.objectID.mockImplementation(x => x)
  }
  if (preserve.indexOf('validation') < 0) {
    const validator = jest.fn().mockReturnValue(true)
    services.validation.validate.mockReturnValue(true)
    services.validation.validator.mockReturnValue(validator)
  }
  if (preserve.indexOf('model') < 0) {
    services.model.add.mockReturnValue(model)
  }
  if (preserve.indexOf('router') < 0) {
    services.router.add.mockReturnValue(router)
  }
  return services
}

export function mock(
  config: Partial<ICoreConfig> = {},
  preserve: string | string[] = [],
  customServices: any = {}
): IMock {
  if (!(preserve instanceof Array)) preserve = [preserve]
  preserve = preserve.concat(Object.keys(customServices))
  if (config.quiet === undefined) config.quiet = true
  const cursor = mockCursor()
  const collection = mockCollection(cursor)
  const model = mockModel()
  const router = mockRouter()
  const app = new CoreApp(config as any, customServices)
  const services = mockServices(app, collection, model, router, preserve)
  const reset = () => {
    mockClear(cursor)
    mockClear(collection)
    mockClear(services)
    mockClear(model)
    mockClear(router)
  }
  return { app, cursor, collection, model, services, reset, router }
}
