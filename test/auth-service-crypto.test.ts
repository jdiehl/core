jest.mock('mz')

import { AuthService, ErrorUnauthorized, IAuthConfig, IUser, User } from '../src'
import { mock, mockResolve } from './util'

let mz: any

const config: IAuthConfig = { secret: 'mysecret' }
const { app, collection, services } = mock({ auth: config }, ['auth', 'model'])
const auth = services.auth as any as AuthService
let user: User

beforeAll(async () => {
  mz = require('mz')
  collection.findOne.mockImplementation(mockResolve({ verified: true, salt: 'salt' }))
  await app.init()
  user = (auth as any).user
})

afterAll(async () => {
  await app.destroy()
})

beforeEach(() => {
  mz.__reset()
})

test('authenticate() should call pbkdf2', async () => {
  await expect(user.authenticate('u1@b.c', 'foo')).rejects.toBeInstanceOf(ErrorUnauthorized)
  expect(mz.crypto.pbkdf2).toHaveBeenCalledTimes(1)
  expect(mz.crypto.pbkdf2).toHaveBeenCalledWith('mysecret,foo', 'salt', 10000, 512, 'sha512')
})

test('insert() should call randomBytes', async () => {
  await user.insert({ email: 'u1@b.c', password: 'password' })
  expect(mz.crypto.randomBytes).toHaveBeenCalledTimes(1)
})

test('insert() should call pbkdf2', async () => {
  await user.insert({ email: 'u1@b.c', password: 'bar' })
  expect(mz.crypto.pbkdf2).toHaveBeenCalledTimes(1)
  expect(mz.crypto.pbkdf2).toHaveBeenCalledWith('mysecret,bar', 'random', 10000, 512, 'sha512')
})
