jest.unmock('redis')

import { wait } from '@-)/utils'

import { ICacheConfig } from '../'
import { mock } from './util'

function runLiveTests(config: ICacheConfig) {
  const { app, services, reset } = mock({ cache: config }, 'cache')
  const cache = services.cache

  beforeAll(async () => {
    await app.init()
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(() => {
    reset()
    const x = jest.fn()
  })

  test('set() should store a simple value', async () => {
    await cache.set('foo', 'bar')
    const x = await cache.get('foo')
    expect(x).toBe('bar')
  })

  test('set() should clone an object', async () => {
    const a = { a: { b: 3 } }
    await cache.set('something', a)
    const x = await cache.get('something')
    expect(x).not.toBe(a)
    expect(x).toEqual(a)
  })

  test('set() should overwrite a previous value', async () => {
    await cache.set('x', 1)
    await cache.set('x', 2)
    const x = await cache.get('x')
    expect(x).toBe(2)
  })

  test('del() should remove a value', async () => {
    await cache.set('x', 1)
    await cache.del('x')
    const x = await cache.get('x')
    expect(x).toBeUndefined
  })

  test('hset() should create a hash', async () => {
    await cache.hset('hash', 'a', 1)
    await cache.hset('hash', 'b', { x: 2 })
    const x = await cache.hget('hash')
    expect(x).toEqual({ a: 1, b: { x: 2 } })
  })

  test('hset() should update a hash', async () => {
    await cache.hset('hash', 'a', 1)
    await cache.hset('hash', 'a', 2)
    const x = await cache.hget('hash', 'a')
    expect(x).toBe(2)
  })

  test('hdel() should delete a hash', async () => {
    await cache.hset('hash', 'a', 1)
    await cache.hdel('hash')
    const x = await cache.hget('hash')
    expect(x).toBeUndefined
  })

  test('expire() should expire a key', async () => {
    await cache.set('a', 1)
    await cache.expire('a', .01)
    const x = await cache.get('a')
    expect(x).toBe(1)
    await wait(11)
    const y = await cache.get('a')
    expect(y).toBeUndefined
  })

  test('flush() should remove all objects', async () => {
    await cache.set('z', 1)
    await cache.flush()
    const x = await cache.get('z')
    expect(x).toBeUndefined
  })
}

describe('mem:', () => runLiveTests({ server: 'mem://' }))
describe.skip('redis:localhost', () => runLiveTests({ server: 'redis://127.0.0.1:6379/3' }))
