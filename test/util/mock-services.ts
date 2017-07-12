
import { each } from '@-)/utils'
import { SinonStub, stub } from 'sinon'
import { CoreService, ICoreServices } from '../../'

export interface IMockServices {
  auth: { find: SinonStub, findOne: SinonStub, update: SinonStub, login: SinonStub, signup: SinonStub }
  cache: { del: SinonStub, get: SinonStub, set: SinonStub, hdel: SinonStub, hget: SinonStub, hset: SinonStub,
    expire: SinonStub, flush: SinonStub, sessionStore: SinonStub }
  db: { collection: SinonStub, objectID: SinonStub }
  email: { send: SinonStub, sendTemplate: SinonStub }
  slack: { post: SinonStub }
  stats: { store: SinonStub }
  token: { require: SinonStub, create: SinonStub, use: SinonStub }
}

export interface IMockCollection {
  count: SinonStub
  createIndex: SinonStub
  deleteMany: SinonStub
  deleteOne: SinonStub
  drop: SinonStub
  dropIndex: SinonStub
  find: SinonStub
  findOne: SinonStub
  insertMany: SinonStub
  insertOne: SinonStub
  updateMany: SinonStub
  updateOne: SinonStub
}

export interface IMockCursor {
  count: SinonStub
  filter: SinonStub
  limit: SinonStub
  map: SinonStub
  next: SinonStub
  project: SinonStub
  skip: SinonStub
  sort: SinonStub
  toArray: SinonStub
}

function mackMockCursor(): IMockCursor {
  const cursor: any = {}
  cursor.count = stub().resolves()
  cursor.filter = stub().returns(cursor)
  cursor.limit = stub().returns(cursor)
  cursor.map = stub().returns(cursor)
  cursor.next = stub().resolves()
  cursor.project = stub().returns(cursor)
  cursor.skip = stub().returns(cursor)
  cursor.sort = stub().returns(cursor)
  cursor.toArray = stub().resolves([{ _id: 'id1' }, { _id: 'id2' }])
  return cursor
}

function makeMockCollection(cursor: any): IMockCollection {
  return {
    count: stub().resolves(),
    createIndex: stub().resolves(),
    deleteMany: stub().resolves({ deletedCount: 2 }),
    deleteOne: stub().resolves({ deletedCount: 1 }),
    drop: stub().resolves(),
    dropIndex: stub().resolves(),
    find: stub().returns(cursor),
    findOne: stub().resolves({ _id: 'id1' }),
    insertMany: stub().resolves({ insertedCount: 2, insertedIds: ['id1', 'id2'] }),
    insertOne: stub().resolves({ insertedCount: 1, insertedId: 'id1' }),
    updateMany: stub().resolves({ modifiedCount: 2 }),
    updateOne: stub().resolves({ modifiedCount: 1 })
  }
}

function makeMockService(asyncMethods?: string[], methods?: string[]): any {
  const service: any = {
    beforeInit: stub().resolves(),
    destroy: stub().resolves(),
    init: stub().resolves(),
    install: stub()
  }
  if (methods) for (const method of methods) {
    service[method] = stub()
  }
  if (asyncMethods) for (const method of asyncMethods) {
    service[method] = stub().resolves()
  }
  return service
}

function makeMockServices(collection: any): IMockServices {
  const services: IMockServices = {
    auth: makeMockService(['find', 'findOne', 'update', 'login', 'signup']),
    cache: makeMockService(['get', 'set', 'flush']),
    db: makeMockService(['drop'], ['collection', 'objectID']),
    email: makeMockService(['send', 'sendTemplate']),
    slack: makeMockService(['post']),
    stats: makeMockService(['store']),
    token: makeMockService(undefined, ['create', 'use', 'require'])
  }
  services.db.collection.returns(collection)
  services.db.objectID.returnsArg(0)
  services.token.create.resolves('token-ok')
  return services
}

export function resetMockServices() {
  each(mockServices, s => {
    each(s, method => method.resetHistory())
  })
  each(mockCollection, method => method.resetHistory())
  each(mockCursor, method => method.resetHistory())
}

export const mockCursor: IMockCursor = mackMockCursor()
export const mockCollection: IMockCollection = makeMockCollection(mockCursor)
export const mockServices: IMockServices = makeMockServices(mockCollection)
