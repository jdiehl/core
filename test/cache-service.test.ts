import { each, wait } from '@-)/utils'
import { expect } from 'chai'
import * as redis from 'redis'
import { stub } from 'sinon'

import { CacheService } from '../'
import { ICacheStore } from '../src/services/cache/cache-interface'
import { mockServices, resetMockServices } from './util'

function runLiveTests(config: string) {
  let cache: CacheService

  beforeEach(async () => {
    resetMockServices()
    cache = new CacheService({ cache: config } as any, mockServices as any)
    await cache.beforeInit()
    await cache.flush()
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

  it('del() should remove a value', async () => {
    await cache.set('x', 1)
    await cache.del('x')
    const x = await cache.get('x')
    expect(x).to.be.undefined
  })

  it('hset() should create a hash', async () => {
    await cache.hset('hash', 'a', 1)
    await cache.hset('hash', 'b', { x: 2 })
    const x = await cache.hget('hash')
    expect(x).to.deep.equal({ a: 1, b: { x: 2 } })
  })

  it('hset() should update a hash', async () => {
    await cache.hset('hash', 'a', 1)
    await cache.hset('hash', 'a', 2)
    const x = await cache.hget('hash', 'a')
    expect(x).to.equal(2)
  })

  it('hdel() should delete a hash', async () => {
    await cache.hset('hash', 'a', 1)
    await cache.hdel('hash')
    const x = await cache.hget('hash')
    expect(x).to.be.undefined
  })

  it('expire() should expire a key', async () => {
    await cache.set('a', 1)
    await cache.expire('a', .01)
    const x = await cache.get('a')
    expect(x).to.equal(1)
    await wait(11)
    const y = await cache.get('a')
    expect(y).to.be.undefined
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
  describe.skip('redis:localhost', () => runLiveTests('redis://127.0.0.1:6379/3'))

  describe('redis:', () => {
    let cache: CacheService
    const redisCreateClient = redis.createClient
    const client = {
      del: stub().yields(),
      expire: stub().yields(),
      flushall: stub().yields(),
      get: stub().yields(null, 'ok'),
      hdel: stub().yields(),
      hget: stub().yields(null, 'ok'),
      hset: stub().yields(),
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
      cache = new CacheService({ cache: 'redis://host:1234/13'} as any, mockServices as any)
      await cache.beforeInit()
    })

    it('beforeInit() should create a redis client', async () => {
      expect(createClient.callCount).to.equal(1)
      expect(createClient.args[0]).to.deep.equal(['redis://host:1234/13'])
    })

    it('get() should call get on the redis client', async () => {
      const value = await cache.get('foo')
      expect(value).to.equal('ok')
      expect(client.get.callCount).to.equal(1)
      expect(client.get.args[0][0]).to.equal('foo')
    })

    it('get() should parse json from the redis client', async () => {
      client.get.yields(null, '{"a":1}')
      const value = await cache.get('foo')
      expect(value).to.deep.equal({ a: 1 })
    })

    it('set() should call set on the redis client', async () => {
      const value = await cache.set('a', 1)
      expect(client.set.callCount).to.equal(1)
      expect(client.set.args[0][0]).to.equal('a')
      expect(client.set.args[0][1]).to.equal('1')
    })

    it('set() should stringify json strings', async () => {
      const value = await cache.set('foo', 'bar')
      expect(client.set.args[0][0]).to.equal('foo')
      expect(client.set.args[0][1]).to.equal('"bar"')
    })

    it('set() should stringify json objects', async () => {
      const value = await cache.set('x', { y: 2 })
      expect(client.set.args[0][0]).to.equal('x')
      expect(client.set.args[0][1]).to.equal('{"y":2}')
    })

    it('del() should call del on the redis client', async () => {
      const value = await cache.del('a')
      expect(client.del.callCount).to.equal(1)
      expect(client.del.args[0][0]).to.equal('a')
    })

    it('hdel() should call hdel on the redis client', async () => {
      const value = await cache.hdel('a', 'b')
      expect(client.hdel.callCount).to.equal(1)
      expect(client.hdel.args[0][0]).to.equal('a')
      expect(client.hdel.args[0][1]).to.equal('b')
    })

    it('hdel() should call del on the redis client', async () => {
      const value = await cache.hdel('foo')
      expect(client.hdel.callCount).to.equal(0)
      expect(client.del.callCount).to.equal(1)
      expect(client.del.args[0][0]).to.equal('foo')
    })

    it('hget() should call hget on the redis client', async () => {
      const value = await cache.hget('foo', 'bar')
      expect(value).to.equal('ok')
      expect(client.get.callCount).to.equal(0)
      expect(client.hget.callCount).to.equal(1)
      expect(client.hget.args[0][0]).to.equal('foo', 'bar')
    })

    it('hset() should call hset on the redis client', async () => {
      const value = await cache.hset('a', 'b', 1)
      expect(client.set.callCount).to.equal(0)
      expect(client.hset.callCount).to.equal(1)
      expect(client.hset.args[0][0]).to.equal('a')
      expect(client.hset.args[0][1]).to.equal('b')
      expect(client.hset.args[0][2]).to.equal('1')
    })

    it('hdel() should call hdel on the redis client', async () => {
      const value = await cache.hdel('a', 'b')
      expect(client.del.callCount).to.equal(0)
      expect(client.hdel.callCount).to.equal(1)
      expect(client.hdel.args[0][0]).to.equal('a', 'b')
    })

    it('flush() should call flushall on the redis client', async () => {
      await cache.flush()
      expect(client.flushall.callCount).to.equal(1)
    })

    it('destroy() should call quit on the redis client', async () => {
      await cache.destroy()
      expect(client.quit.callCount).to.equal(1)
    })

    it('expire() should call expire on the redis client', async () => {
      await cache.expire('a', 13)
      expect(client.expire.callCount).to.equal(1)
      expect(client.expire.args[0][0]).to.equal('a')
      expect(client.expire.args[0][1]).to.equal(13)
    })

    it('sessionStore.set() should call set and expire on the redis client', async () => {
      await cache.sessionStore.set('sid', { foo: 'bar' }, 13)
      expect(client.set.callCount).to.equal(1)
      expect(client.set.args[0][0]).to.equal('session:sid')
      expect(client.set.args[0][1]).to.equal('{"foo":"bar"}')
      expect(client.expire.callCount).to.equal(1)
      expect(client.expire.args[0][0]).to.equal('session:sid')
      expect(client.expire.args[0][1]).to.equal(13)
    })

    it('sessionStore.get() should call get on the redis client', async () => {
      await cache.sessionStore.get('sid')
      expect(client.get.callCount).to.equal(1)
      expect(client.get.args[0][0]).to.equal('session:sid')
    })

    it('sessionStore.destroy() should call del on the redis client', async () => {
      await cache.sessionStore.destroy('sid')
      expect(client.del.callCount).to.equal(1)
      expect(client.del.args[0][0]).to.equal('session:sid')
    })

  })

})
