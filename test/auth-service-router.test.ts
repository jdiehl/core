import { expect } from 'chai'
import { crypto } from 'mz'
import { Server } from 'net'
import * as request from 'request-promise-native'
import { stub } from 'sinon'

const { del, get, post, put } = request.defaults({ json: true })

import { AuthService } from '../'
import { IUserInternal } from '../src/services/auth/auth-interface'
import { mockServer } from './util'
import { expectRejection, mockCollection, mockCursor, mockServices, resetMockServices } from './util'

describe('auth-router', () => {
  let auth: AuthService
  let server: Server
  let host: string
  let u1: IUserInternal
  let u2: IUserInternal

  before(async () => {
    const config = { auth: { secret: 'mysecret', prefix: '/auth', iterations: 1, verifyEmail: true } }
    auth = new AuthService(config as any, mockServices as any)
    await auth.init()
    server = await mockServer(auth)
    host = `http://127.0.0.1:${server.address().port}`

    const hashBuffer = await crypto.pbkdf2('mysecret,secret', 'salt1', 1, 512, 'sha512')
    const hash = hashBuffer.toString('base64')
    u1 = { _id: 'id1', email: 'u1@b.c', hash, profile: { name: 'Peter' }, role: 'user', salt: 'salt1', verified: true }
    u2 = { _id: 'id2', email: 'u2@b.c', hash: 'hash2', profile: { name: 'Susan' }, role: 'admin', salt: 'salt2',
      verified: true }
    mockCursor.toArray.resolves([u1, u2])
    mockCollection.findOne.resolves(u1)
    mockServices.token.use.resolves({ type: 'signup', user: 'id3' })
  })

  after((done) => {
    mockCursor.toArray.resolves([{ _id: 'id1' }, { _id: 'id2' }])
    mockCollection.findOne.resolves({ _id: 'id1' })
    mockServices.token.use.resolves()
    server.close(done)
  })

  beforeEach(async () => {
    resetMockServices()
  })

  it('GET / should find and sanitize users', async () => {
    const users = await get(`${host}/auth`)
    expect(users).to.deep.equal([
      { _id: 'id1', email: 'u1@b.c', profile: { name: 'Peter' }, role: 'user' },
      { _id: 'id2', email: 'u2@b.c', profile: { name: 'Susan' }, role: 'admin' }
    ])
    expect(mockCollection.find.callCount).to.equal(1)
  })

  it('GET /id1 should find and sanitize a user', async () => {
    const user = await get(`${host}/auth/id1`)
    expect(user).to.deep.equal({ _id: 'id1', email: 'u1@b.c', profile: { name: 'Peter' }, role: 'user' })
    expect(mockCollection.findOne.callCount).to.equal(1)
    expect(mockCollection.findOne.args[0][0]).to.deep.equal({ _id: 'id1' })
  })

  it('PUT /id1 should update a user', async () => {
    await put(`${host}/auth/id1`).json({ foo: 'bar' })
    expect(mockCollection.updateOne.callCount).to.equal(1)
    expect(mockCollection.updateOne.args[0]).to.deep.equal([{ _id: 'id1' }, { $set: { profile: { foo: 'bar' } } }])
  })

  it('POST /login should find the requested user', async () => {
    const res = await post(`${host}/auth/login`).json({ email: 'u1@b.c', password: 'secret' })
    expect(mockCollection.findOne.callCount).to.equal(1)
    expect(mockCollection.findOne.args[0]).to.deep.equal([{ email: 'u1@b.c', verified: true }])
    expect(res).to.deep.equal({ _id: 'id1', email: 'u1@b.c', profile: { name: 'Peter' }, role: 'user' })
  })

  it('POST /login should reject a wrong password', async () => {
    const data = { email: 'u1@b.c', password: 'wrong' }
    await expectRejection(async () => post(`${host}/auth/login`).json(data), '401 - "Unauthorized"')
  })

  it('POST /login should reject an unverified user', async () => {
    mockCollection.findOne.resolves()
    const data = { email: 'u3@b.c', password: 'secret' }
    await expectRejection(async () => post(`${host}/auth/login`).json(data), '401 - "Unauthorized"')
    mockCollection.findOne.resolves(u1)
  })

  it('POST / should create a new user', async () => {
    const data = { email: 'u3@b.c', password: 'hello', role: 'user', profile: { name: 'Fred' } }
    const res = await post(`${host}/auth`).json(data)
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

  it('POST / should send a signup email with verification token', async () => {
    const data = { email: 'u3@b.c', password: 'hello', role: 'user' }
    await post(`${host}/auth`).json(data)
    expect(mockServices.email.sendTemplate.callCount).to.equal(1)
    expect(mockServices.email.sendTemplate.args[0]).to.deep.equal([
      'signup',
      { user: { _id: 'id1', email: 'u3@b.c', role: 'user' }, token: 'token-ok' },
      { subject: 'Please confirm your email address', to: 'u3@b.c' }
    ])
  })

  it('GET /verify/key should verify a user', async () => {
    await get(`${host}/auth/verify/key`)
    expect(mockServices.token.use.callCount).to.equal(1)
    expect(mockServices.token.use.args[0]).to.deep.equal(['key'])
    expect(mockCollection.updateOne.callCount).to.equal(1)
    expect(mockCollection.updateOne.args[0]).to.deep.equal([{ _id: 'id3' }, { $set: { verified: true } }])
  })

})
