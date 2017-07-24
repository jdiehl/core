import { expect } from 'chai'
import { crypto } from 'mz'
import { stub } from 'sinon'

import { IUser, UserService } from '../'
import { IUserInternal } from '../src/services/user/user-interface'
import { expectRejection, mock } from './util'

describe('user', () => {
  const { cursor, collection, services, resetHistory } = mock()
  let user: UserService
  let u1: IUserInternal
  let u2: IUserInternal

  before(async () => {
    const hashBuffer = await crypto.pbkdf2('mysecret,secret', 'salt1', 1, 512, 'sha512')
    const hash = hashBuffer.toString('base64')
    u1 = { _id: 'id1', email: 'u1@b.c', hash, profile: { name: 'Peter' }, role: 'user', salt: 'salt1', verified: true }
    u2 = { _id: 'id2', email: 'u2@b.c', hash: 'hash2', profile: { name: 'Susan' }, role: 'admin', salt: 'salt2',
      verified: true }
    cursor.toArray.resolves([u1, u2])
    collection.findOne.resolves(u1)
  })

  beforeEach(async () => {
    resetHistory()
    const config = { user: { secret: 'mysecret', iterations: 1 } }
    user = new UserService(config as any, services as any)
    await user.init()
  })

  it('should create a unique index on email', () => {
    expect(collection.createIndex.callCount).to.equal(1)
    expect(collection.createIndex.args[0]).to.deep.equal([['email'], { unique: true }])
  })

  it('find() should find and sanitize users', async () => {
    const users = await user.find()
    expect(users).to.deep.equal([
      { _id: 'id1', email: 'u1@b.c', profile: { name: 'Peter' }, role: 'user' },
      { _id: 'id2', email: 'u2@b.c', profile: { name: 'Susan' }, role: 'admin' }
    ])
    expect(collection.find.callCount).to.equal(1)
  })

  it('findOne() should find and sanitize a user', async () => {
    const u = await user.findOne('id')
    expect(u).to.deep.equal({ _id: 'id1', email: 'u1@b.c', profile: { name: 'Peter' }, role: 'user' })
    expect(collection.findOne.callCount).to.equal(1)
    expect(collection.findOne.args[0][0]).to.deep.equal({ _id: 'id' })
  })

  it('update() should update a user', async () => {
    const update = { verified: true, role: 'admin', profile: { foo: 'bar' } }
    await user.update('id1', update)
    expect(collection.updateOne.callCount).to.equal(1)
    expect(collection.updateOne.args[0]).to.deep.equal([{ _id: 'id1' }, { $set: update }])
  })

  it('update() should not update the salt', async () => {
    await user.update('id1', { salt: 'nono' })
    expect(collection.updateOne.args[0]).to.deep.equal([{ _id: 'id1' }, { $set: {} }])
  })

  it('update() with password should update the salt and hash', async () => {
    await user.update('id1', { password: 'new' })
    const update = collection.updateOne.args[0][1].$set
    expect(update.salt).to.be.a('string')
    expect(update.hash).to.be.a('string')
    expect(update.password).to.be.undefined
  })

  it('authenticate() should find the requested user', async () => {
    const res = await user.authenticate('u1@b.c', 'secret')
    expect(collection.findOne.callCount).to.equal(1)
    expect(collection.findOne.args[0]).to.deep.equal([{ email: 'u1@b.c' }])
    expect(res).to.deep.equal({ _id: 'id1', email: 'u1@b.c', profile: { name: 'Peter' }, role: 'user' })
  })

  it('authenticate() should reject a wrong password', async () => {
    await expectRejection(() => user.authenticate('u1@b.c', 'wrong'), 'Unauthorized')
  })

  it('authenticate() should reject an unverified user', async () => {
    collection.findOne.resolves({})
    await expectRejection(() => user.authenticate('u3@b.c', 'secret'), 'Unauthorized')
    collection.findOne.resolves(u1)
  })

  it('insert() should create a new user', async () => {
    const res = await user.insert({ email: 'u3@b.c', password: 'hello', role: 'user', profile: { name: 'Fred' } })
    expect(res).to.deep.equal({ _id: 'id1', email: 'u3@b.c', profile: { name: 'Fred' }, role: 'user' })
    expect(collection.insertOne.callCount).to.equal(1)
    expect(collection.insertOne.args[0]).to.have.length(1)
    const u = collection.insertOne.args[0][0]
    expect(u.email).to.equal('u3@b.c')
    expect(u.role).to.equal('user')
    expect(u.hash).to.be.a('string')
    expect(u.hash).to.have.length(684)
    expect(u.salt).to.be.a('string')
    expect(u.hash).to.have.length(684)
    expect(u.profile).to.deep.equal({ name: 'Fred' })
    expect(u.verified).to.be.undefined
  })

  it('verify() should verify a user', async () => {
    await user.verify('id3')
    expect(collection.updateOne.callCount).to.equal(1)
    expect(collection.updateOne.args[0]).to.deep.equal([{ _id: 'id3' }, { $set: { verified: true } }])
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

    it('authenticate() should call pbkdf2', async () => {
      await expectRejection(() => user.authenticate('u1@b.c', 'password'), 'Unauthorized')
      expect(pbkdf2.callCount).to.equal(1)
      expect(pbkdf2.args[0]).to.deep.equal(['mysecret,password', 'salt1', 1, 512, 'sha512'])
    })

    it('insert() should call randomBytes', async () => {
      await user.insert({ email: 'u1@b.c', password: 'password', role: 'user' })
      expect(randomBytes.callCount).to.equal(1)
    })

    it('insert() should call pbkdf2', async () => {
      await user.insert({ email: 'u1@b.c', password: 'password', role: 'user' })
      expect(pbkdf2.callCount).to.equal(1)
      expect(pbkdf2.args[0]).to.deep.equal(['mysecret,password', 'random', 1, 512, 'sha512'])
    })

  })

})
