jest.unmock('mz')

import { TokenService } from '../'
import { mock, mockResolve } from './util'

const config = { user: 'xxx', admin: 'yyy' }
const { app, services, reset } = mock({ tokens: config }, 'token')
const token = services.token as any as TokenService

const next = jest.fn()
const reject = jest.fn()

beforeAll(async () => {
  await app.init()
})

afterAll(async () => {
  await app.destroy()
})

beforeEach(() => {
  reset()
  services.cache.get.mockImplementation(mockResolve({ reference: 'ok' }))
  next.mockReset()
  reject.mockReset()
})

test('should allow the correct user token', () => {
  token.require('user')(mockContext('xxx'), next)
  expect(next).toHaveBeenCalledTimes(1)
  expect(reject).toHaveBeenCalledTimes(0)
})

test('should allow the correct admin token', () => {
  token.require('admin')(mockContext('yyy'), next)
  expect(next).toHaveBeenCalledTimes(1)
  expect(reject).toHaveBeenCalledTimes(0)
})

test('should reject an invalid token', () => {
  token.require('user')(mockContext('yyy'), next)
  expect(next).toHaveBeenCalledTimes(0)
  expect(reject).toHaveBeenCalledTimes(1)
})

test('should allow the user token if both are allowed', () => {
  token.require(['user', 'admin'])(mockContext('xxx'), next)
  expect(next).toHaveBeenCalledTimes(1)
  expect(reject).toHaveBeenCalledTimes(0)
})

test('should allow the admin token if both are allowed', () => {
  token.require(['user', 'admin'])(mockContext('yyy'), next)
  expect(next).toHaveBeenCalledTimes(1)
  expect(reject).toHaveBeenCalledTimes(0)
})

test('create() should create a random token', async () => {
  const key = await token.create({ a: 1 })
  expect(typeof key).toBe('string')
  expect(key).toHaveLength(128)
  expect(services.cache.set).toHaveBeenCalledTimes(1)
  expect(services.cache.set).toHaveBeenCalledWith(`token:${key}`, { reference: { a: 1 } })
})

test('create() should set the useCount', async () => {
  await token.create({}, { useCount: 3 })
  expect(services.cache.set.mock.calls[0][1]).toEqual({ reference: {}, usesLeft: 3 })
})

test('create() should set the expiry date', async () => {
  await token.create({}, { validFor: '1s' })
  const { validUntil } = services.cache.set.mock.calls[0][1]
  expect(validUntil - new Date().getTime() - 1000).toBeLessThan(100)
})

test('use() should retrieve a token', async () => {
  const ref = await token.use('key')
  expect(ref).toBe('ok')
  expect(services.cache.get).toHaveBeenCalledTimes(1)
  expect(services.cache.get).toHaveBeenCalledWith(`token:key`)
})

test('use() should update the use counter', async () => {
  services.cache.get.mockImplementation(mockResolve({ reference: 'uses', usesLeft: 3 }))
  await token.use('key')
  expect(services.cache.set).toHaveBeenCalledTimes(1)
  expect(services.cache.set).toHaveBeenCalledWith(`token:key`, { reference: 'uses', usesLeft: 2 })
})

test('use() should reject an expired use counter', async () => {
  services.cache.get.mockImplementation(mockResolve({ reference: 'expired', usesLeft: 0 }))
  await expect(token.use('key')).rejects.toMatchObject({ message: 'Invalid Token' })
})

test('use() should reject an expired date', async () => {
  services.cache.get.mockImplementation(mockResolve({ reference: 'expired', validUntil: new Date().getTime() - 1000 }))
  await expect(token.use('key')).rejects.toMatchObject({ message: 'Invalid Token' })
})

function mockContext(t: string): any {
  return {
    request: { header: { 'authentication-token': t } },
    throw: reject
  }
}
