import { expect } from 'chai'
import { stub } from 'sinon'

import { StatsService } from '../'
import { expectRejection, mockCollection, mockServices, resetMockServices } from './util'

describe('stats', () => {
  let stats: StatsService

  beforeEach(async () => {
    resetMockServices()
    stats = new StatsService({ stats: { collection: 'test' } } as any, mockServices as any)
    await stats.init()
  })

  it('should request a collection', async () => {
    expect(mockServices.db.collection.callCount).to.equal(1)
    expect(mockServices.db.collection.args[0]).to.deep.equal(['test'])
  })

  it('should install a middleware', async () => {
    const use = stub()
    stats.install({ use } as any)
    expect(use.callCount).to.equal(1)
  })

  it('should call stats.store() from the middleware', async () => {
    let middleware: any
    const use = (f: any) => middleware = f
    const store = stub().resolves()
    stats.store = store
    stats.install({ use } as any)
    const context = {}
    await middleware(context, async () => {})
    expect(store.callCount).to.equal(1)
    expect(store.args[0]).to.have.length(3)
    expect(store.args[0][0]).to.deep.equal(context)
    expect(store.args[0][1]).to.be.a('Date')
    expect(store.args[0][2]).to.be.a('number')
  })

  it('should not call stats.store() from the middleware on an error', async () => {
    let middleware: any
    const use = (f: any) => middleware = f
    const store = stub().resolves()
    stats.store = store
    stats.install({ use } as any)
    await expectRejection(() => middleware({}, async () => { throw new Error() }))
    expect(store.callCount).to.equal(0)
  })

  it('store() should insert a document', async () => {
    const method = 'PUT'
    const path = '/test1'
    const user = { _id: 'user' }
    const params = {}
    const body = {}
    const date = new Date()
    const time = 42
    await stats.store({ method, path, user, params, body } as any, date, time)
    expect(mockCollection.insertOne.callCount).to.equal(1)
    const doc = { date, time, userId: 'user', method, path, params, body }
    expect(mockCollection.insertOne.args[0]).to.deep.equal([doc])
  })

  it('store() should mask passwords', async () => {
    const method = 'POST'
    const path = '/test2'
    const params = {}
    const body = { email: 'a@b.c', password: 'hello' }
    const date = new Date()
    const time = 42
    await stats.store({ method, path, params, body } as any, date, time)
    expect(mockCollection.insertOne.callCount).to.equal(1)
    const doc = { date, time, method, path, params, body: { email: 'a@b.c', password: '######' } }
    expect(mockCollection.insertOne.args[0]).to.deep.equal([doc])
  })

  it('store() should include a header field', async () => {
    stats = new StatsService({ stats: { includeHeader: ['bar'] } } as any, mockServices as any)
    await stats.init()
    const method = 'GET'
    const path = '/'
    const params = {}
    const body = {}
    const header = { bar: 'myHeader '}
    const date = new Date()
    const time = 42
    await stats.store({ method, path, params, body, header } as any, date, time)
    const doc = { date, time, method, path, params, body, header }
    expect(mockCollection.insertOne.args[0]).to.deep.equal([doc])
  })

})
