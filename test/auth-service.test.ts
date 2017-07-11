import { expect } from 'chai'
import { crypto } from 'mz'
import { stub } from 'sinon'

import { AuthService, IUser } from '../'
import { IUserInternal } from '../src/services/auth/auth-interface'
import { expectRejection, mockCollection, mockCursor, mockServices, resetMockServices } from './util'

describe('auth', () => {
  let auth: AuthService
  let u1: IUserInternal
  let u2: IUserInternal

  before(async () => {
    const hashBuffer = await crypto.pbkdf2('mysecret,secret', 'salt1', 1, 512, 'sha512')
    const hash = hashBuffer.toString('base64')
    u1 = { _id: 'id1', email: 'u1@b.c', hash, profile: { name: 'Peter' }, role: 'user', salt: 'salt1', verified: true }
    u2 = { _id: 'id2', email: 'u2@b.c', hash: 'hash2', profile: { name: 'Susan' }, role: 'admin', salt: 'salt2',
      verified: true }
    mockCursor.toArray.resolves([u1, u2])
    mockCollection.findOne.resolves(u1)
    mockServices.token.use.resolves({ type: 'signup', user: 'id3' })
  })

  after(() => {
    mockCursor.toArray.resolves([{ _id: 'id1' }, { _id: 'id2' }])
    mockCollection.findOne.resolves({ _id: 'id1' })
    mockServices.token.use.resolves()
  })

  beforeEach(async () => {
    resetMockServices()
    const config = { auth: { secret: 'mysecret', prefix: '/auth', iterations: 1, verifyEmail: true } }
    auth = new AuthService(config as any, mockServices as any)
    await auth.init()
  })

  it('should create a unique index on email', () => {
    expect(mockCollection.createIndex.callCount).to.equal(1)
    expect(mockCollection.createIndex.args[0]).to.deep.equal([['email', 'verified'], { unique: true }])
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
    await auth.update('id1', { foo: 'bar' })
    expect(mockCollection.updateOne.callCount).to.equal(1)
    expect(mockCollection.updateOne.args[0]).to.deep.equal([{ _id: 'id1' }, { $set: { profile: { foo: 'bar' } } }])
  })

  it('login() should find the requested user', async () => {
    const res = await auth.login('u1@b.c', 'secret')
    expect(mockCollection.findOne.callCount).to.equal(1)
    expect(mockCollection.findOne.args[0]).to.deep.equal([{ email: 'u1@b.c', verified: true }])
    expect(res).to.deep.equal({ _id: 'id1', email: 'u1@b.c', profile: { name: 'Peter' }, role: 'user' })
  })

  it('login() should reject a wrong password', async () => {
    await expectRejection(() => auth.login('u1@b.c', 'wrong'), 'Unauthorized')
  })

  it('login() should reject an unverified user', async () => {
    mockCollection.findOne.resolves()
    await expectRejection(() => auth.login('u3@b.c', 'secret'), 'Unauthorized')
    mockCollection.findOne.resolves(u1)
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
    expect(user.hash).to.have.length(684)
    expect(user.salt).to.be.a('string')
    expect(user.hash).to.have.length(684)
    expect(user.profile).to.deep.equal({ name: 'Fred' })
    expect(user.verified).to.be.undefined
  })

  it('insert() should send a signup email with verification token', async () => {
    await auth.insert({ email: 'u3@b.c', password: 'hello', role: 'user' })
    expect(mockServices.email.sendTemplate.callCount).to.equal(1)
    expect(mockServices.email.sendTemplate.args[0]).to.deep.equal([
      'signup',
      { user: { _id: 'id1', email: 'u3@b.c', role: 'user' }, token: 'token-ok' },
      { subject: 'Please confirm your email address', to: 'u3@b.c' }
    ])
  })

  it('verify() should verify a user', async () => {
    await auth.verify('key')
    expect(mockServices.token.use.callCount).to.equal(1)
    expect(mockServices.token.use.args[0]).to.deep.equal(['key'])
    expect(mockCollection.updateOne.callCount).to.equal(1)
    expect(mockCollection.updateOne.args[0]).to.deep.equal([{ _id: 'id3' }, { $set: { verified: true } }])
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
      await expectRejection(() => auth.login('u1@b.c', 'password'), 'Unauthorized')
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
