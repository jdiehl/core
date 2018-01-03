jest.unmock('mz')

import { crypto } from 'mz'

import { AuthService, ErrorUnauthorized, IAuthConfig, IUser, User } from '../src'
import { mock, mockResolve } from './util'

const config: IAuthConfig = { secret: 'mysecret', iterations: 1 }
const { app, cursor, collection, services, reset } = mock({ auth: config }, ['auth', 'model'])
const auth = services.auth as any as AuthService
let user: User

let u1: IUser
let u2: IUser

beforeAll(async () => {
  await app.init()
  user = (auth as any).user
})

afterAll(async () => {
  await app.destroy()
})

beforeEach(async () => {
  u1 = await mockUser('id1', 'u1@b.c', 'secret', { name: 'Peter' })
  u2 = await mockUser('id2', 'u2@b.c', 'unknown', { name: 'Susan' })
  cursor.toArray.mockImplementation(mockResolve([u1, u2]))
  collection.findOne.mockImplementation(mockResolve(u1))
})

afterEach(() => {
  reset()
})

test('should create a unique index on email', () => {
  expect(collection.createIndex).toHaveBeenCalledTimes(1)
  expect(collection.createIndex).toHaveBeenCalledWith('email', { unique: true })
})

test('find() should find and sanitize users', async () => {
  const users = await user.find()
  expect(users).toEqual([
    { _id: 'id1', email: 'u1@b.c', profile: { name: 'Peter' }, verified: true },
    { _id: 'id2', email: 'u2@b.c', profile: { name: 'Susan' }, verified: true }
  ])
  expect(collection.find).toHaveBeenCalledTimes(1)
})

test('findOne() should find and sanitize a user', async () => {
  const u = await user.findOne('id')
  expect(u).toEqual({ _id: 'id1', email: 'u1@b.c', profile: { name: 'Peter' }, verified: true })
  expect(collection.findOne).toHaveBeenCalledTimes(1)
  expect(collection.findOne).toHaveBeenCalledWith({ _id: 'id' })
})

test('update() should update a user', async () => {
  const update = { verified: true, profile: { foo: 'bar' } }
  await user.update('id1', update)
  expect(collection.updateOne).toHaveBeenCalledTimes(1)
  expect(collection.updateOne).toHaveBeenCalledWith({ _id: 'id1' }, { $set: update })
})

test('update() should not update the salt', async () => {
  await user.update('id1', { salt: 'nono' } as any)
  expect(collection.updateOne).toHaveBeenCalledWith({ _id: 'id1' }, { $set: {} })
})

test('update() with password should update the salt and hash', async () => {
  await user.update('id1', { password: 'new' })
  const update = collection.updateOne.mock.calls[0][1].$set
  expect(typeof update.salt).toBe('string')
  expect(typeof update.hash).toBe('string')
  expect(update.password).toBeUndefined
})

test('authenticate() should find the requested user', async () => {
  const res = await user.authenticate('u1@b.c', 'secret')
  expect(collection.findOne).toHaveBeenCalledTimes(1)
  expect(collection.findOne).toHaveBeenCalledWith({ email: 'u1@b.c' })
  expect(res).toEqual({ _id: 'id1', email: 'u1@b.c', profile: { name: 'Peter' }, verified: true })
})

test('authenticate() should reject a wrong password', async () => {
  await expect(user.authenticate('u1@b.c', 'wrong')).rejects.toBeInstanceOf(ErrorUnauthorized)
})

test('authenticate() should reject an unverified user', async () => {
  collection.findOne.mockImplementation(mockResolve())
  await expect(user.authenticate('u3@b.c', 'secret')).rejects.toBeInstanceOf(ErrorUnauthorized)
})

test('insert() should create a new user', async () => {
  const res = await user.insert({ email: 'u3@b.c', password: 'hello', profile: { name: 'Fred' } })
  expect(res).toEqual({ _id: 'id1', email: 'u3@b.c', profile: { name: 'Fred' } })
  expect(collection.insertOne).toHaveBeenCalledTimes(1)
  expect(collection.insertOne).toHaveBeenCalledWith({
    email: 'u3@b.c',
    hash: expect.any(String),
    profile: { name: 'Fred' },
    salt: expect.any(String)
  })
})

test('verify() should verify a user', async () => {
  await user.verify('id3')
  expect(collection.updateOne).toHaveBeenCalledTimes(1)
  expect(collection.updateOne).toHaveBeenCalledWith({ _id: 'id3' }, { $set: { verified: true } })
})

async function mockUser(
  id: string,
  email: string,
  password: string,
  profile: any,
  verified = true
): Promise<any> {
  const salt = (await crypto.randomBytes(512)).toString('base64')
  const hash = (await crypto.pbkdf2(`mysecret,${password}`, salt, 1, 512, 'sha512')).toString('base64')
  return { _id: id, email, hash, profile, salt, verified }
}
