import { expect } from 'chai'
import { Server } from 'net'
import * as request from 'request-promise-native'
import { stub } from 'sinon'

const { del, get, post, put } = request.defaults({ json: true, jar: true })

import { AuthService } from '../'
import { mockServer } from './util'
import { expectRejection, mock } from './util'

describe('auth-router', () => {
  const config = { auth: { prefix: '/auth', verifyEmail: true } }
  const { app, collection, services, resetHistory } = mock(config, 'auth')
  const auth: AuthService = services.auth as any
  let host: string
  const u1 = { _id: 'id', email: 'u1@test', profile: {} }

  before(async () => {
    await app.init()
    await app.listen()
    host = `http://127.0.0.1:${app.instance.address().port}`
  })

  after(async () => {
    await app.close()
  })

  beforeEach(async () => {
    resetHistory()
    services.token.use.resolves({ type: 'signup', user: 'id' })
    services.token.create.resolves('token')
    services.user.authenticate.resolves(u1)
    services.user.findOne.resolves(u1)
    services.user.unserialize.resolves(u1)
    services.user.serialize.resolves('id')
    services.user.insert.resolves(u1)
  })

  it('GET / should not be found', async () => {
    await expectRejection(async () => await get(`${host}`), '404 - "Not Found"')
  })

  it('Manipulations without authentication should be rejected', async () => {
    await expectRejection(async () => await get(`${host}/auth`), '401 - "Unauthorized"')
    await expectRejection(async () => await post(`${host}/auth`).json({}), '401 - "Unauthorized"')
  })

  it('POST /auth/login should call authenticate()', async () => {
    const res = await post(`${host}/auth/login`).json({ email: 'u1@b.c', password: 'secret' })
    expect(res).to.deep.equal(u1)
    expect(services.user.authenticate.callCount).to.equal(1)
    expect(services.user.authenticate.args[0]).to.deep.equal(['u1@b.c', 'secret'])
  })

  it('POST /auth/login should set the session', async () => {
    const res = await post(`${host}/auth/login`).json({ email: 'u1@b.c', password: 'secret' })
    expect(services.user.serialize.callCount).to.equal(1)
  })

  it('POST /auth/login should reject an invalid authentication', async () => {
    services.user.authenticate.rejects()
    await expectRejection(async () => {
      await post(`${host}/auth/login`).json({ email: 'u1@b.c', password: 'secret' })
    }, '500 - "Internal Server Error"')
    services.user.authenticate.reset()
  })

  it('GET /auth/verify/key should call use() and verify()', async () => {
    const res = await get(`${host}/auth/verify/key`)
    expect(res).to.equal('OK')
    expect(services.token.use.callCount).to.equal(1)
    expect(services.token.use.args[0]).to.deep.equal(['key'])
    expect(services.user.verify.callCount).to.equal(1)
    expect(services.user.verify.args[0]).to.deep.equal(['id'])
  })

  it('GET /auth/verify/key should fail', async () => {
    services.token.use.resolves()
    await expectRejection(async () => get(`${host}/auth/verify/key`), '401 - "Unauthorized"')
  })

  it('POST /auth/signup should call insert()', async () => {
    const res = await post(`${host}/auth/signup`).json({ email: 'u3@b.c', password: 'hello' })
    expect(services.user.insert.callCount).to.equal(1)
    expect(res).to.deep.equal(u1)
  })

  it('POST /auth/signup should create a token and send an email', async () => {
    await post(`${host}/auth/signup`).json({ email: 'u3@b.c', password: 'hello' })
    expect(services.token.create.callCount).to.equal(1)
    expect(services.token.create.args[0]).to.deep.equal([
      { type: 'signup', user: 'id' },
      { useCount: 1, validFor: '2w' }
    ])
    expect(services.email.sendTemplate.callCount).to.equal(1)
    expect(services.email.sendTemplate.args[0]).to.deep.equal([
      'signup',
      { token: 'token', user: u1 },
      { subject: 'Please confirm your email address', to: 'u1@test' }
    ])
  })

  describe('authenticated', () => {

    beforeEach(async () => {
      await post(`${host}/auth/login`).json({ email: 'u1@b.c', password: 'secret' })
      services.user.unserialize.resetHistory()
    })

    it('GET /auth should return the active user', async () => {
      const res = await get(`${host}/auth`)
      expect(res).deep.equal(u1)
      expect(services.user.unserialize.callCount).to.equal(1)
      expect(services.user.unserialize.args[0]).to.deep.equal(['id'])
    })

    it('POST /auth should update the active user', async () => {
      await post(`${host}/auth`).json({ profile: { foo: 'bar '} })
      expect(services.user.update.callCount).to.equal(1)
      expect(services.user.update.args[0]).to.deep.equal(['id', { profile: { foo: 'bar '} }])
    })

    it('POST /auth/logout should log out the user', async () => {
      await post(`${host}/auth/logout`)
      await expectRejection(async () => get(`${host}/auth`), '401 - "Unauthorized"')
    })

  })

})
