import { each, makeIndex } from '@didie/utils'
import { ObjectID } from 'mongodb'
import { CoreApp, CoreService, ICoreConfig, ICoreServices } from '../../'
import { coreServices } from '../../src/core-app'
import { IDbCollection, IDbCursor } from '../../src/services/db/db-interface'
import { mockClear, MockifiedObject, MockifiedObjects,
  mockify, mockifyClasses, mockifyMany, mockResolve } from './mockify'

export type MockCollection = MockifiedObject<IDbCollection>
export type MockCursor = MockifiedObject<IDbCursor>
export type MockServices = MockifiedObjects<ICoreServices> & { resetHistory: () => void }

export interface IMock {
  app: CoreApp
  collection: MockCollection
  cursor: MockCursor
  services: MockServices
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
  collection.count = jest.fn(mockResolve()),
  collection.createIndex = jest.fn(mockResolve()),
  collection.deleteMany = jest.fn(mockResolve({ deletedCount: 2 })),
  collection.deleteOne = jest.fn(mockResolve({ deletedCount: 1 })),
  collection.drop = jest.fn(mockResolve()),
  collection.dropIndex = jest.fn(mockResolve()),
  collection.find = jest.fn().mockReturnValue(cursor),
  collection.findOne = jest.fn(mockResolve({ _id: 'id1' })),
  collection.insertMany = jest.fn(mockResolve({ insertedCount: 2, insertedIds: ['id1', 'id2'] })),
  collection.insertOne = jest.fn(mockResolve({ insertedCount: 1, insertedId: 'id1' })),
  collection.updateMany = jest.fn(mockResolve({ modifiedCount: 2 })),
  collection.updateOne = jest.fn(mockResolve({ modifiedCount: 1 }))
  return collection as MockCollection
}

function mockServices(app: CoreApp, collection: MockCollection, preserve: string[]): MockServices {
  const services = mockifyMany(app.services, name => preserve.indexOf(name) < 0,
    m => m.mockImplementation(mockResolve()))
  if (preserve.indexOf('db') < 0) {
    services.db.collection.mockReturnValue(collection)
    services.db.objectID.mockImplementation(x => x)
  }
  if (preserve.indexOf('validation') < 0) {
    services.validation.validate.mockReturnValue(true)
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
  const app = new CoreApp(config as any, customServices)
  const services = mockServices(app, collection, preserve)
  const reset = () => {
    mockClear(cursor)
    mockClear(collection)
    mockClear(services)
  }
  return { app, cursor, collection, services, reset }
}
