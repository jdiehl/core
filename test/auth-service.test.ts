import { expect } from 'chai'
import { crypto } from 'mz'
import { stub } from 'sinon'

import { AuthService, IUser } from '../'
import { IUserInternal } from '../src/services/auth/auth-interface'
import { mockCollection, mockCursor, mockServices, resetMockServices } from './util'

describe('auth', () => {
  let auth: AuthService
  let u1: IUserInternal
  let u2: IUserInternal

  before(async () => {
    const hashBuffer = await crypto.pbkdf2('mysecret,secret', 'salt1', 1, 512, 'sha512')
    const hash = hashBuffer.toString('base64')
    u1 = { _id: 'id1', email: 'u1@b.c', hash, profile: { name: 'Peter' }, salt: 'salt1', role: 'user' }
    u2 = { _id: 'id2', email: 'u2@b.c', hash: 'hash2', profile: { name: 'Susan' }, salt: 'salt2', role: 'admin' }
    mockCursor.toArray.resolves([u1, u2])
    mockCollection.findOne.resolves(u1)
  })

  after(() => {
    mockCursor.toArray.resolves([{ _id: 'id1' }, { _id: 'id2' }])
    mockCollection.findOne.resolves({ _id: 'id1' })
  })

  beforeEach(async () => {
    resetMockServices()
    auth = new AuthService({ auth: { secret: 'mysecret', prefix: '/auth', iterations: 1 } } as any, mockServices as any)
    await auth.init()
  })

  it('should create a unique index on email', () => {
    expect(mockCollection.createIndex.callCount).to.equal(1)
    expect(mockCollection.createIndex.args[0]).to.deep.equal(['email', { unique: true }])
  })

  it('find() should find and sanitize users', async () => {
    const users = await auth.find()
    expect(users).to.deep.equal([
      { _id: 'id1', email: 'u1@b.c', profile: { name: 'Peter' }, role: 'user' },
      { _id: 'id2', email: 'u2@b.c', profile: { name: 'Susan' }, role: 'admin' }
    ])
    expect(mockCollection.find.callCount).to.equal(1)
  })

  it('findOne() should find and sanitize a user', async () => {
    const user = await auth.findOne('id')
    expect(user).to.deep.equal({ _id: 'id1', email: 'u1@b.c', profile: { name: 'Peter' }, role: 'user' })
    expect(mockCollection.findOne.callCount).to.equal(1)
    expect(mockCollection.findOne.args[0][0]).to.deep.equal({ _id: 'id' })
  })

  it('update() should update a user', async () => {
    const id: any = {}
    const profile = {}
    await auth.update(id, profile)
    expect(mockCollection.updateOne.callCount).to.equal(1)
    expect(mockCollection.updateOne.args[0]).to.deep.equal([{ _id: id }, { $set: { profile } }])
  })

  it('login() should find the requested user', async () => {
    const res = await auth.login('u1@b.c', 'secret')
    expect(mockCollection.findOne.callCount).to.equal(1)
    expect(mockCollection.findOne.args[0]).to.deep.equal([{ email: 'u1@b.c' }])
    expect(res).to.deep.equal({ _id: 'id1', email: 'u1@b.c', profile: { name: 'Peter' }, role: 'user' })
  })

  it('login() should reject a wrong password', async () => {
    try {
      await auth.login('u1@b.c', 'wrong')
      expect(false).to.be.true
    } catch (err) {
      expect(err.message).to.equal('Invalid Login')
    }
  })

  it('insert() should create a new user', async () => {
    const res = await auth.insert({ email: 'u3@b.c', password: 'hello', role: 'user', profile: { name: 'Fred' } })
    expect(res).to.deep.equal({ _id: 'id1', email: 'u3@b.c', profile: { name: 'Fred' }, role: 'user' })
    expect(mockCollection.insertOne.callCount).to.equal(1)
    expect(mockCollection.insertOne.args[0]).to.have.length(1)
    const user = mockCollection.insertOne.args[0][0]
    expect(user.email).to.equal('u3@b.c')
    expect(user.role).to.equal('user')
    expect(user.hash).to.be.a('string')
    expect(user.salt).to.be.a('string')
    expect(user.profile).to.deep.equal({ name: 'Fred' })
  })

  describe('mock-crypto', () => {
    const cryptoPbkdf2 = crypto.pbkdf2
    const cryptoRandomBytes = crypto.randomBytes
    const pbkdf2 = stub().resolves('ok')
    const randomBytes = stub().returns('random')
    const cryptoAny = crypto as any

    before(() => {
      cryptoAny.pbkdf2 = pbkdf2
      cryptoAny.randomBytes = randomBytes
    })

    after(() => {
      cryptoAny.pbkdf2 = cryptoPbkdf2
      cryptoAny.randomBytes = cryptoRandomBytes
    })

    beforeEach(() => {
      pbkdf2.resetHistory()
      randomBytes.resetHistory()
    })

    it('login() should call pbkdf2', async () => {
      try {
        await auth.login('u1@b.c', 'password')
      } catch (err) {}
      expect(pbkdf2.callCount).to.equal(1)
      expect(pbkdf2.args[0]).to.deep.equal(['mysecret,password', 'salt1', 1, 512, 'sha512'])
    })

    it('insert() should call randomBytes', async () => {
      await auth.insert({ email: 'u1@b.c', password: 'password', role: 'user' })
      expect(randomBytes.callCount).to.equal(1)
    })

    it('insert() should call pbkdf2', async () => {
      await auth.insert({ email: 'u1@b.c', password: 'password', role: 'user' })
      expect(pbkdf2.callCount).to.equal(1)
      expect(pbkdf2.args[0]).to.deep.equal(['mysecret,password', 'random', 1, 512, 'sha512'])
    })

  })

})
