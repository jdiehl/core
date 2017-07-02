import { expect } from 'chai'
import { stub } from 'sinon'

import { StatsService } from '../'

describe.only('stats', () => {
  const insertOne = stub().resolves()
  const collection = stub().returns({ insertOne })
  const db = { collection }
  let stats: StatsService

  beforeEach(async () => {
    insertOne.resetHistory()
    stats = new StatsService({ stats: { collection: 'test' } } as any, { db } as any)
    await stats.init()
  })

  it('should request a collection', async () => {
    expect(collection.callCount).to.equal(1)
    expect(collection.getCall(0).args).to.deep.equal(['test'])
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
    expect(store.getCall(0).args).to.deep.equal([context])
  })

  it('should not call stats.store() from the middleware on an error', async () => {
    let middleware: any
    const use = (f: any) => middleware = f
    const store = stub().resolves()
    stats.store = store
    stats.install({ use } as any)
    try {
      await middleware({}, async () => { throw new Error() })
    } catch (err) {}
    expect(store.callCount).to.equal(0)
  })

  it('store() should insert a document', async () => {
    const method = 'PUT'
    const path = '/test1'
    const user = { _id: 'user' }
    const params = {}
    const body = {}
    await stats.store({ method, path, user, params, body } as any)
    expect(insertOne.callCount).to.equal(1)
    expect(insertOne.getCall(0).args).to.deep.equal([{ userId: 'user', method, path, params, body }])
  })

  it('store() should mask passwords', async () => {
    const method = 'POST'
    const path = '/test2'
    const params = {}
    const body = { email: 'a@b.c', password: 'hello' }
    await stats.store({ method, path, params, body } as any)
    expect(insertOne.callCount).to.equal(1)
    const doc = { method, path, params, body: { email: 'a@b.c', password: '######' } }
    expect(insertOne.getCall(0).args).to.deep.equal([doc])
  })

  it('store() should include a header field', async () => {
    stats = new StatsService({ stats: { includeHeader: ['bar'] } } as any, { db } as any)
    await stats.init()
    const context = { method: 'GET', path: '/', params: {}, body: {}, header: { bar: 'myHeader' }}
    await stats.store(context as any)
    expect(insertOne.getCall(0).args).to.deep.equal([context])
  })

})
