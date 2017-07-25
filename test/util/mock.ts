import { each, makeIndex } from '@-)/utils'
import { ObjectID } from 'mongodb'
import { SinonStub, stub } from 'sinon'
import { CoreApp, CoreService, ICoreConfig, ICoreServices } from '../../'
import { coreServices } from '../../src/core-app'
import { IDbCollection, IDbCursor } from '../../src/services/db/db-interface'
import { MockifiedObject, MockifiedObjects, mockify, mockifyClasses, mockifyMany, mockReset } from './mockify'

export type MockCollection = MockifiedObject<IDbCollection>
export type MockCursor = MockifiedObject<IDbCursor>
export type MockServices = MockifiedObjects<ICoreServices> & { resetHistory: () => void }

export interface IMock {
  app: CoreApp
  collection: MockCollection
  cursor: MockCursor
  services: MockServices
  resetHistory: () => void
}

function mockCursor(): MockCursor {
  const cursor: Partial<MockCursor> = {}
  cursor.count = stub().resolves()
  cursor.filter = stub().returns(cursor)
  cursor.limit = stub().returns(cursor)
  cursor.map = stub().returns(cursor)
  cursor.next = stub().resolves()
  cursor.project = stub().returns(cursor)
  cursor.skip = stub().returns(cursor)
  cursor.sort = stub().returns(cursor)
  cursor.toArray = stub().resolves([{ _id: 'id1' }, { _id: 'id2' }])
  return cursor as MockCursor
}

function mockCollection(cursor: MockCursor): MockCollection {
  const collection: Partial<MockCollection> = {}
  collection.count = stub().resolves(),
  collection.createIndex = stub().resolves(),
  collection.deleteMany = stub().resolves({ deletedCount: 2 }),
  collection.deleteOne = stub().resolves({ deletedCount: 1 }),
  collection.drop = stub().resolves(),
  collection.dropIndex = stub().resolves(),
  collection.find = stub().returns(cursor),
  collection.findOne = stub().resolves({ _id: 'id1' }),
  collection.insertMany = stub().resolves({ insertedCount: 2, insertedIds: ['id1', 'id2'] }),
  collection.insertOne = stub().resolves({ insertedCount: 1, insertedId: 'id1' }),
  collection.updateMany = stub().resolves({ modifiedCount: 2 }),
  collection.updateOne = stub().resolves({ modifiedCount: 1 })
  return collection as MockCollection
}

function mockServices(collection: MockCollection): MockServices {
  const services = mockifyClasses<ICoreServices>(coreServices as any, s => s.resolves())
  services.db.collection.returns(collection)
  services.db.objectID.returnsArg(0)
  return services as MockServices
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
  const services = mockifyMany(app.services, name => preserve.indexOf(name) < 0, m => m.resolves())
  if (preserve.indexOf('db') < 0) {
    services.db.collection.returns(collection)
    services.db.objectID.returnsArg(0)
  }
  const resetHistory = () => {
    mockReset(cursor)
    mockReset(collection)
    mockReset(services)
  }
  return { app, cursor, collection, services, resetHistory }
}
