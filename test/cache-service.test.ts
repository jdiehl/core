jest.mock('redis')

import { CacheService } from '../'
import { mock, mockYield } from './util'

const { app, services, reset } = mock({ cache: 'redis://host:1234/13'}, 'cache')
const cache = services.cache as any as CacheService
let redis: any
let client: any

beforeAll(async () => {
  redis = require('redis')
  client = redis.__client
  await app.init()
})

afterAll(async () => {
  await app.destroy()
})

beforeEach(() => {
  reset()
  redis.__reset()
})

test('get() should call get on the redis client', async () => {
  const value = await cache.get('foo')
  expect(value).toBe('ok')
  expect(client.get).toHaveBeenCalledTimes(1)
  expect(client.get).toHaveBeenCalledWith('foo', expect.any(Function))
})

test('get() should parse json from the redis client', async () => {
  client.get.mockImplementation(mockYield(null, '{"a":1}'))
  const value = await cache.get('foo')
  expect(value).toEqual({ a: 1 })
})

test('set() should call set on the redis client', async () => {
  const value = await cache.set('a', 1)
  expect(client.set).toHaveBeenCalledTimes(1)
  expect(client.set).toHaveBeenCalledWith('a', '1', expect.any(Function))
})

test('set() should stringify json strings', async () => {
  const value = await cache.set('foo', 'bar')
  expect(client.set).toHaveBeenCalledWith('foo', '"bar"', expect.any(Function))
})

test('set() should stringify json objects', async () => {
  const value = await cache.set('x', { y: 2 })
  expect(client.set).toHaveBeenCalledWith('x', '{"y":2}', expect.any(Function))
})

test('del() should call del on the redis client', async () => {
  const value = await cache.del('a')
  expect(client.del).toHaveBeenCalledTimes(1)
  expect(client.del).toHaveBeenCalledWith('a', expect.any(Function))
})

test('hdel() should call hdel on the redis client', async () => {
  const value = await cache.hdel('a', 'b')
  expect(client.hdel).toHaveBeenCalledTimes(1)
  expect(client.hdel).toHaveBeenCalledWith('a', 'b', expect.any(Function))
})

test('hdel() should call del on the redis client', async () => {
  const value = await cache.hdel('foo')
  expect(client.hdel).toHaveBeenCalledTimes(0)
  expect(client.del).toHaveBeenCalledTimes(1)
  expect(client.del).toHaveBeenCalledWith('foo', expect.any(Function))
})

test('hget() should call hget on the redis client', async () => {
  const value = await cache.hget('foo', 'bar')
  expect(value).toBe('ok')
  expect(client.get).toHaveBeenCalledTimes(0)
  expect(client.hget).toHaveBeenCalledTimes(1)
  expect(client.hget).toHaveBeenCalledWith('foo', 'bar', expect.any(Function))
})

test('hset() should call hset on the redis client', async () => {
  const value = await cache.hset('a', 'b', 1)
  expect(client.set).toHaveBeenCalledTimes(0)
  expect(client.hset).toHaveBeenCalledTimes(1)
  expect(client.hset).toHaveBeenCalledWith('a', 'b', '1', expect.any(Function))
})

test('hdel() should call hdel on the redis client', async () => {
  const value = await cache.hdel('a', 'b')
  expect(client.del).toHaveBeenCalledTimes(0)
  expect(client.hdel).toHaveBeenCalledTimes(1)
  expect(client.hdel).toHaveBeenCalledWith('a', 'b', expect.any(Function))
})

test('flush() should call flushall on the redis client', async () => {
  await cache.flush()
  expect(client.flushall).toHaveBeenCalledTimes(1)
})

test('destroy() should call quit on the redis client', async () => {
  await cache.destroy()
  expect(client.quit).toHaveBeenCalledTimes(1)
})

test('expire() should call expire on the redis client', async () => {
  await cache.expire('a', 13)
  expect(client.expire).toHaveBeenCalledTimes(1)
  expect(client.expire).toHaveBeenCalledWith('a', 13, expect.any(Function))
})

test('sessionStore.set() should call set and expire', async () => {
  await cache.sessionStore.set('sid', { foo: 'bar' }, 13)
  expect(client.set).toHaveBeenCalledTimes(1)
  expect(client.set).toHaveBeenCalledWith('session:sid', '{"foo":"bar"}', expect.any(Function))
  expect(client.expire).toHaveBeenCalledTimes(1)
  expect(client.expire).toHaveBeenCalledWith('session:sid', 13, expect.any(Function))
})

test('sessionStore.get() should call get', async () => {
  await cache.sessionStore.get('sid')
  expect(client.get).toHaveBeenCalledTimes(1)
  expect(client.get).toHaveBeenCalledWith('session:sid', expect.any(Function))
})

test('sessionStore.destroy() should call del', async () => {
  await cache.sessionStore.destroy('sid')
  expect(client.del).toHaveBeenCalledTimes(1)
  expect(client.del).toHaveBeenCalledWith('session:sid', expect.any(Function))
})
