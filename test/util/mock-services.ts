
import { each } from '@-)/utils'
import { SinonStub, stub } from 'sinon'
import { CoreService, ICoreServices } from '../../'

export interface IMockServices {
  auth: { find: SinonStub, findOne: SinonStub, update: SinonStub, login: SinonStub, signup: SinonStub }
  cache: { get: SinonStub, set: SinonStub, flush: SinonStub }
  db: { collection: SinonStub }
  email: { send: SinonStub }
  slack: { post: SinonStub }
  stats: { store: SinonStub }
  token: { require: SinonStub }
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
  cursor.toArray = stub().resolves()
  return cursor
}

function makeMockCollection(cursor: any): IMockCollection {
  return {
    count: stub().resolves(),
    createIndex: stub().resolves(),
    deleteMany: stub().resolves(),
    deleteOne: stub().resolves(),
    drop: stub().resolves(),
    dropIndex: stub().resolves(),
    find: stub().returns(cursor),
    findOne: stub().resolves(),
    insertMany: stub().resolves(),
    insertOne: stub().resolves(),
    updateMany: stub().resolves(),
    updateOne: stub().resolves()
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
    db: makeMockService(['drop']),
    email: makeMockService(['send']),
    slack: makeMockService(['post']),
    stats: makeMockService(['store']),
    token: makeMockService(undefined, ['require'])
  }
  services.db.collection = stub().returns(collection)
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
