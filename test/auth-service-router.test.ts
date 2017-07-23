import { expect } from 'chai'
import { Server } from 'net'
import * as request from 'request-promise-native'
import { stub } from 'sinon'

const { del, get, post, put } = request.defaults({ json: true, jar: true })

import { AuthService } from '../'
import { mockServer } from './util'
import { expectRejection, mock } from './util'

describe('auth-router', () => {
  const { services, resetHistory } = mock()
  let auth: AuthService
  let server: Server
  let host: string
  const u1 = { _id: 'id', email: 'u1@test', profile: {} }
  const sFindOne = stub().returns('find-one-ok')
  const sFind = stub().returns('find-ok')
  const sInsert = stub().returns('insert-ok')
  const sUpdate = stub().returns('update-ok')
  const sDelete = stub().returns('delete-ok')
  const sLogin = stub().returns(u1)
  const sVerify = stub().returns('verify-ok')

  class Auth extends AuthService {
    collectionName: 'not-used'
    async findOne(...args: any[]) { return sFindOne(...args) }
    async find(...args: any[]) { console.trace(); return sFind(...args) }
    async insert(...args: any[]) { return sInsert(...args) }
    async update(...args: any[]) { return sUpdate(...args) }
    async delete(...args: any[]) { return sDelete(...args) }
    async login(...args: any[]) { return sLogin(...args) }
    async verify(...args: any[]) { return sVerify(...args) }
  }

  before(async () => {
    const config = { auth: { secret: 'mysecret', prefix: '/auth', iterations: 1, verifyEmail: true } }
    auth = new Auth(config as any, services as any)
    await auth.init()
    server = await mockServer(auth, app => auth.install(app))
    host = `http://127.0.0.1:${server.address().port}`
  })

  after((done) => {
    server.close(done)
  })

  beforeEach(async () => {
    resetHistory()
    sFindOne.resetHistory()
    sFind.resetHistory()
    sInsert.resetHistory()
    sUpdate.resetHistory()
    sDelete.resetHistory()
    sLogin.resetHistory()
    sVerify.resetHistory()
  })

  it('GET / be rejected', async () => {
    await expectRejection(async () => await get(`${host}/auth`), '401 - "Unauthorized"')
  })

  it('GET /id1 be rejected', async () => {
    await expectRejection(async () => await get(`${host}/auth/id1`), '401 - "Unauthorized"')
  })

  it('PUT /id1 be rejected', async () => {
    await expectRejection(async () => await put(`${host}/auth/id1`).json({ foo: 'bar' }), '401 - "Unauthorized"')
  })

  it('POST / should be rejected', async () => {
    await expectRejection(async () => await post(`${host}/auth`).json({}), '401 - "Unauthorized"')
  })

  it('POST /login should call login()', async () => {
    const res = await post(`${host}/auth/login`).json({ email: 'u1@b.c', password: 'secret' })
    expect(res).to.equal('OK')
    expect(sLogin.callCount).to.equal(1)
    expect(sLogin.args[0]).to.deep.equal(['u1@b.c', 'secret'])
  })

  it('GET /verify/key should call verify()', async () => {
    const res = await get(`${host}/auth/verify/key`)
    expect(res).to.equal('OK')
    expect(sVerify.callCount).to.equal(1)
    expect(sVerify.args[0]).to.deep.equal(['key'])
  })

  describe('authenticated', () => {

    beforeEach(async () => {
      await post(`${host}/auth/login`).json({ email: 'u1@b.c', password: 'secret' })
    })

    it('GET /user should return the active user', async () => {
      await get(`${host}/auth/user`)
      const res = await get(`${host}/auth/user`)
      expect(res).equal('find-one-ok')
    })

    // it('GET /id1 should call findOne()', async () => {
    //   const res = await get(`${host}/auth/id1`)
    //   expect(res).equal('find-one-ok')
    //   expect(sFindOne.callCount).to.equal(1)
    //   expect(sFindOne.args[0]).to.deep.equal(['id1'])
    // })

    // it('PUT /id1 should call update()', async () => {
    //   const res = await put(`${host}/auth/id1`).json({ foo: 'bar' })
    //   expect(res).to.equal('update-ok')
    //   expect(sUpdate.callCount).to.equal(1)
    //   expect(sUpdate.args[0]).to.deep.equal(['id1', { foo: 'bar' }])
    // })

    // it('POST / should call insert()', async () => {
    //   const data = { email: 'u3@b.c', password: 'hello', role: 'user', profile: { name: 'Fred' } }
    //   const res = await post(`${host}/auth`).json(data)
    //   expect(res).to.equal('insert-ok')
    //   expect(sInsert.callCount).to.equal(1)
    //   expect(sInsert.args[0]).to.deep.equal([data])
    // })

  })

})
