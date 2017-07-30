jest.unmock('request-promise-native')

import { Server } from 'net'
import * as request from 'request-promise-native'
import { AuthService } from '../'
import { mock, mockReject, mockResolve } from './util'

const { del, get, post, put } = request.defaults({ json: true, jar: true })
const config = { prefix: '/auth', verifyEmail: true }
const { app, collection, services, reset } = mock({ auth: config }, 'auth')
const auth: AuthService = services.auth as any
let host: string
const u1 = { _id: 'id', email: 'u1@test', profile: {} }

beforeAll(async () => {
  await app.init()
  await app.listen()
  host = `http://127.0.0.1:${app.instance.address().port}`
})

afterAll(async () => {
  await app.destroy()
})

beforeEach(async () => {
  reset()
  services.token.use.mockImplementation(mockResolve({ type: 'signup', user: 'id' }))
  services.token.create.mockImplementation(mockResolve('token'))
  services.user.authenticate.mockImplementation(mockResolve(u1))
  services.user.findOne.mockImplementation(mockResolve(u1))
  services.user.unserialize.mockImplementation(mockResolve(u1))
  services.user.serialize.mockImplementation(mockResolve('id'))
  services.user.insert.mockImplementation(mockResolve(u1))
})

test('GET / should not be found', async () => {
  await expect(get(`${host}`)).rejects.toMatchObject({ statusCode: 404 })
})

test('Manipulations without authentication should be rejected', async () => {
  await expect(get(`${host}/auth`)).rejects.toMatchObject({ statusCode: 401 })
  await expect(post(`${host}/auth`).json({})).rejects.toMatchObject({ statusCode: 401 })
})

test('POST /auth/login should call authenticate()', async () => {
  const res = await post(`${host}/auth/login`).json({ email: 'u1@b.c', password: 'secret' })
  expect(res).toEqual(u1)
  expect(services.user.authenticate).toHaveBeenCalledTimes(1)
  expect(services.user.authenticate).toHaveBeenCalledWith('u1@b.c', 'secret')
})

test('POST /auth/login should set the session', async () => {
  const res = await post(`${host}/auth/login`).json({ email: 'u1@b.c', password: 'secret' })
  expect(services.user.serialize).toHaveBeenCalledTimes(1)
})

test('POST /auth/login should reject an invalid authentication', async () => {
  services.user.authenticate.mockImplementation(mockReject())
  const user = { email: 'u1@b.c', password: 'secret' }
  await expect(post(`${host}/auth/login`).json(user)).rejects.toMatchObject({ statusCode: 500 })
  services.user.authenticate.mockReset()
})

test('GET /auth/verify/key should call use() and verify()', async () => {
  const res = await get(`${host}/auth/verify/key`)
  expect(res).toBe('OK')
  expect(services.token.use).toHaveBeenCalledTimes(1)
  expect(services.token.use).toHaveBeenCalledWith('key')
  expect(services.user.verify).toHaveBeenCalledTimes(1)
  expect(services.user.verify).toHaveBeenCalledWith('id')
})

test('GET /auth/verify/key should fail', async () => {
  services.token.use.mockImplementation(mockResolve())
  await expect(get(`${host}/auth/verify/key`)).rejects.toMatchObject({ statusCode: 401 })
})

test('POST /auth/signup should call insert()', async () => {
  const res = await post(`${host}/auth/signup`).json({ email: 'u3@b.c', password: 'hello' })
  expect(services.user.insert).toHaveBeenCalledTimes(1)
  expect(res).toEqual(u1)
})

test('POST /auth/signup should create a token and send an email', async () => {
  await post(`${host}/auth/signup`).json({ email: 'u3@b.c', password: 'hello' })
  expect(services.token.create).toHaveBeenCalledTimes(1)
  expect(services.token.create).toHaveBeenCalledWith(
    { type: 'signup', user: 'id' },
    { useCount: 1, validFor: '2w' }
  )
  expect(services.email.sendTemplate).toHaveBeenCalledTimes(1)
  expect(services.email.sendTemplate).toHaveBeenCalledWith(
    'signup',
    { token: 'token', user: u1 },
    { subject: 'Please confirm your email address', to: 'u1@test' }
  )
})

describe('authenticated', () => {

  beforeEach(async () => {
    await post(`${host}/auth/login`).json({ email: 'u1@b.c', password: 'secret' })
    services.user.unserialize.mockClear()
  })

  test('GET /auth should return the active user', async () => {
    const res = await get(`${host}/auth`)
    expect(res).toEqual(u1)
    expect(services.user.unserialize).toHaveBeenCalledTimes(1)
    expect(services.user.unserialize).toHaveBeenCalledWith('id')
  })

  test('POST /auth should update the active user', async () => {
    await post(`${host}/auth`).json({ profile: { foo: 'bar '} })
    expect(services.user.update).toHaveBeenCalledTimes(1)
    expect(services.user.update).toHaveBeenCalledWith('id', { profile: { foo: 'bar '} })
  })

  test('POST /auth/logout should log out the user', async () => {
    await post(`${host}/auth/logout`)
    await expect(get(`${host}/auth`)).rejects.toMatchObject({ statusCode: 401 })
  })

})
