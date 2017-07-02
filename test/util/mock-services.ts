
import { each } from '@-)/utils'
import { SinonStub, stub } from 'sinon'
import { CoreService, ICoreServices } from '../../'

function makeCursorStub(): Record<string, SinonStub> {
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

function makeCollectionStub(cursor: any): Record<string, SinonStub> {
  return {
    count: stub().resolves(),
    createIndex: stub().resolves(),
    deleteMany: stub().resolves(),
    deleteOne: stub().resolves(),
    drop: stub().resolves(),
    dropIndex: stub().resolves(),
    find: stub().resolves(cursor),
    findOne: stub().resolves(),
    insertMany: stub().resolves(),
    insertOne: stub().resolves(),
    updateMany: stub().resolves(),
    updateOne: stub().resolves()
  }
}

function makeMockServiceStub(asyncMethods?: string[], methods?: string[]): any {
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

function makeMockServiceStubs(collection: any): any {
  const services = {
    auth: makeMockServiceStub(['find', 'findOne', 'update', 'login', 'signup']),
    cache: makeMockServiceStub(['get', 'set', 'flush']),
    db: makeMockServiceStub(['drop']),
    email: makeMockServiceStub(['send']),
    slack: makeMockServiceStub(['post']),
    stats: makeMockServiceStub(['store']),
    token: makeMockServiceStub(undefined, ['require'])
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

export const mockCursor = makeCursorStub()
export const mockCollection = makeCollectionStub(mockCursor)
export const mockServices = makeMockServiceStubs(mockCollection)
