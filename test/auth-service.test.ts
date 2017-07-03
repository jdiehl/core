import { expect } from 'chai'
import { crypto } from 'mz'
import { stub } from 'sinon'

import { AuthService, IUser } from '../'
import { mockCollection, mockCursor, mockServices, resetMockServices } from './util'

describe.only('auth', () => {
  let auth: AuthService
  const u1 = { _id: 'id1', email: 'u1@b.c', hash: 'hash1', profile: { name: 'Peter' }, salt: 'salt1', role: 'user' }
  const u2 = { _id: 'id2', email: 'u2@b.c', hash: 'hash2', profile: { name: 'Susan' }, salt: 'salt2', role: 'admin' }

  before(() => {
    mockCursor.toArray.resolves([u1, u2])
    mockCollection.findOne.resolves(u1)
    mockCollection.insertOne.resolves({ insertedId: 'newid' })
  })

  after(() => {
    mockCursor.toArray.resolves()
    mockCollection.findOne.resolves()
    mockCollection.insertOne.resolves()
  })

  beforeEach(async () => {
    resetMockServices()
    auth = new AuthService({ auth: { secret: 'mysecret', prefix: '/auth' } } as any, mockServices as any)
    await auth.init()
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
    const id: any = {}
    const user = await auth.findOne(id)
    expect(user).to.deep.equal({ _id: 'id1', email: 'u1@b.c', profile: { name: 'Peter' }, role: 'user' })
    expect(mockCollection.findOne.callCount).to.equal(1)
    expect(mockCollection.findOne.getCall(0).args[0]).to.equal(id)
  })

  it('update() should update a user', async () => {
    const id: any = {}
    const profile = {}
    await auth.update(id, profile)
    expect(mockCollection.updateOne.callCount).to.equal(1)
    expect(mockCollection.updateOne.getCall(0).args).to.deep.equal([{ _id: id }, { $set: { profile } }])
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
      await auth.login('u1@b.c', 'password')
      expect(pbkdf2.callCount).to.equal(1)
      expect(pbkdf2.getCall(0).args).to.deep.equal(['mysecret,password', 'salt1', 10000, 512, 'sha512'])
    })

    it('signup() should call randomBytes', async () => {
      await auth.signup('u1@b.c', 'password', 'user')
      expect(randomBytes.callCount).to.equal(1)
    })

    it('signup() should call pbkdf2', async () => {
      await auth.signup('u1@b.c', 'password', 'user')
      expect(pbkdf2.callCount).to.equal(1)
      expect(pbkdf2.getCall(0).args).to.deep.equal(['mysecret,password', 'random', 10000, 512, 'sha512'])
    })

  })

})
