jest.mock('mz')

import { IUser, IUserConfig, UserService } from '../'
import { IUserInternal } from '../src/services/user/user-interface'
import { mock, mockResolve } from './util'

let mz: any

const config: IUserConfig = { secret: 'mysecret' }
const { app, collection, services } = mock({ user: config }, 'user')
const user = services.user as any as UserService

beforeAll(async () => {
  mz = require('mz')
  collection.findOne.mockImplementation(mockResolve({ verified: true, salt: 'salt' }))
  await app.init()
})

afterAll(async () => {
  await app.destroy()
})

beforeEach(() => {
  mz.__reset()
})

test('authenticate() should call pbkdf2', async () => {
  await expect(user.authenticate('u1@b.c', 'foo')).rejects.toMatchObject({ status: 401 })
  expect(mz.crypto.pbkdf2).toHaveBeenCalledTimes(1)
  expect(mz.crypto.pbkdf2).toHaveBeenCalledWith('mysecret,foo', 'salt', 10000, 512, 'sha512')
})

test('insert() should call randomBytes', async () => {
  await user.insert({ email: 'u1@b.c', password: 'password', role: 'user' })
  expect(mz.crypto.randomBytes).toHaveBeenCalledTimes(1)
})

test('insert() should call pbkdf2', async () => {
  await user.insert({ email: 'u1@b.c', password: 'bar', role: 'user' })
  expect(mz.crypto.pbkdf2).toHaveBeenCalledTimes(1)
  expect(mz.crypto.pbkdf2).toHaveBeenCalledWith('mysecret,bar', 'random', 10000, 512, 'sha512')
})
