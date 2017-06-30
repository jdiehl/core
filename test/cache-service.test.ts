import { each } from '@-)/utils'
import { expect } from 'chai'
import * as redis from 'redis'
import { stub } from 'sinon'

import { CacheService } from '../'

function runLiveTests(config: string) {
  let cache: CacheService

  beforeEach(async () => {
    cache = new CacheService({ cache: config } as any, [] as any)
    await cache.beforeInit()
  })

  it('set() should store a simple value', async () => {
    await cache.set('foo', 'bar')
    const x = await cache.get('foo')
    expect(x).to.equal('bar')
  })

  it('set() should clone an object', async () => {
    const a = { a: { b: 3 } }
    await cache.set('something', a)
    const x = await cache.get('something')
    expect(x).to.not.equal(a)
    expect(x).to.deep.equal(a)
  })

  it('set() should overwrite a previous value', async () => {
    await cache.set('x', 1)
    await cache.set('x', 2)
    const x = await cache.get('x')
    expect(x).to.equal(2)
  })

  it('flush() should remove all objects', async () => {
    await cache.set('z', 1)
    await cache.flush()
    const x = await cache.get('z')
    expect(x).to.be.undefined
  })
}

describe('cache-service', () => {

  describe('mem:', () => runLiveTests('mem://'))
  describe.skip('redis:localhost', () => runLiveTests('redis://127.0.0.1:6379'))

  describe('redis:', () => {
    let cache: CacheService
    const redisCreateClient = redis.createClient
    const client = {
      del: stub().yields(),
      flushall: stub().yields(),
      get: stub().yields(null, 'ok'),
      quit: stub().yields(),
      set: stub().yields()
    }
    const createClient = stub().returns(client)

    before(() => {
      (redis as any).createClient = createClient
    })

    after(() => {
      (redis as any).createClient = redisCreateClient
    })

    beforeEach(async () => {
      createClient.resetHistory()
      each(client, c => c.resetHistory())
      cache = new CacheService({ cache: 'redis://host:1234'} as any, [] as any)
      await cache.beforeInit()
    })

    it('beforeInit() should create a redis client', async () => {
      expect(createClient.callCount).to.equal(1)
      expect(createClient.calledWith(1234, 'host')).to.be.true
    })

    it('get() should call get on the redis client', async () => {
      const value = await cache.get('foo')
      expect(value).to.equal('ok')
      expect(client.get.callCount).to.equal(1)
      expect(client.get.calledWith('foo')).to.be.true
    })

    it('get() should parse json from the redis client', async () => {
      client.get.yields(null, '{"a":1}')
      const value = await cache.get('foo')
      expect(value).to.deep.equal({ a: 1 })
    })

    it('set() should call set on the redis client', async () => {
      const value = await cache.set('a', 1)
      expect(client.set.callCount).to.equal(1)
      expect(client.set.calledWith('a', '1')).to.be.true
    })

    it('set() with not value should call del on the redis client', async () => {
      const value = await cache.set('a')
      expect(client.set.callCount).to.equal(0)
      expect(client.del.callCount).to.equal(1)
      expect(client.del.calledWith('a')).to.be.true
    })

    it('set() should stringify json strings', async () => {
      const value = await cache.set('foo', 'bar')
      expect(client.set.calledWith('foo', '"bar"')).to.be.true
    })

    it('set() should stringify json objects', async () => {
      const value = await cache.set('x', { y: 2 })
      expect(client.set.calledWith('x', '{"y":2}')).to.be.true
    })

    it('flush() should cell flushall on the redis client', async () => {
      await cache.flush()
      expect(client.flushall.callCount).to.equal(1)
    })

    it('destroy() should cell quit on the redis client', async () => {
      await cache.destroy()
      expect(client.quit.callCount).to.equal(1)
    })

  })

})
