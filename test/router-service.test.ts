import { expect } from 'chai'
import * as KoaRouter from 'koa-router'
import { Server } from 'net'
import { del, get, post, put } from 'request-promise-native'
import { stub } from 'sinon'

import { CoreService, Delete, Get, Post, Put, Router, RouterService } from '../'
import { expectRejection, mockServer, mockServices, resetMockServices } from './util'

describe('router', () => {
  let service: CoreService
  let server: Server
  let host: string
  const sGet = stub().returns('get-ok')
  const sGetMore = stub().returns('get-more-ok')
  const sPost = stub().returns('post-ok')
  const sPut = stub().returns('put-ok')
  const sDel = stub().returns('del-ok')
  const sCustom = stub().returns('custom-ok')
  const sCustomMapping = stub().returns(['query.a', 'query.b'])

  @Router({ prefix: '/test', redirect: { '/a': '/b' } })
  class Service extends CoreService {
    @Get('/get') async get(...args: any[]) { return sGet.apply(null, args) }
    @Get('/get/:w', ['params.w', 'request.query']) async getMore(...args: any[]) { return sGetMore.apply(null, args) }
    @Post('/post', ['request.body']) async post(...args: any[]) { return sPost.apply(null, args) }
    @Put('/put/:id', ['params.id', 'request.body']) async put(...args: any[]) { return sPut.apply(null, args) }
    @Delete('/del/:id', ['params.id']) async del(...args: any[]) { return sDel.apply(null, args) }
    @Get('/custom', sCustomMapping) async custom(...args: any[]) { return sCustom.apply(null, args) }
  }

  before(async () => {
    service = new Service({} as any, {} as any)
    server = await mockServer(service)
    host = `http://127.0.0.1:${server.address().port}`
  })

  beforeEach(() => {
    sGet.resetHistory()
    sGetMore.resetHistory()
    sPost.resetHistory()
    sPut.resetHistory()
    sDel.resetHistory()
  })

  after((done) => {
    server.close(done)
  })

  it('should create a router', () => {
    expect(service.router).to.be.an.instanceOf(KoaRouter)
  })

  it('get() should not call a method', async () => {
    await expectRejection(async () => await get(host))
    expect(sGet.callCount).to.equal(0)
    expect(sGetMore.callCount).to.equal(0)
    expect(sPost.callCount).to.equal(0)
    expect(sPut.callCount).to.equal(0)
    expect(sDel.callCount).to.equal(0)
  })

  it('get() should prefix the routes', async () => {
    await expectRejection(() => get(`${host}/get`), '404 - "Not Found"')
  })

  it('get() should redirect', async () => {
    await expectRejection(() => get({ url: `${host}/test/a`, followRedirect: false }),
      '301 - "Redirecting to <a href=\\"/b\\">/b</a>."')
  })

  it('should create a get route', async () => {
    const res = await get(`${host}/test/get`)
    expect(res).to.equal('get-ok')
    expect(sGet.callCount).to.equal(1)
  })

  it('should create a get route with parameters', async () => {
    const res = await get(`${host}/test/get/more?x=a&y=b`)
    expect(res).to.equal('get-more-ok')
    expect(sGetMore.callCount).to.equal(1)
    expect(sGetMore.args[0]).to.deep.equal(['more', { x: 'a', y: 'b' }])
  })

  it('should create a post route', async () => {
    const res = await post(`${host}/test/post`).json({ a: 1, b: [2] })
    expect(res).to.equal('post-ok')
    expect(sPost.callCount).to.equal(1)
    expect(sPost.args[0]).to.deep.equal([{ a: 1, b: [2] }])
  })

  it('should create a put route', async () => {
    const res = await put(`${host}/test/put/23`).json({ foo: 'bar' })
    expect(res).to.equal('put-ok')
    expect(sPut.callCount).to.equal(1)
    expect(sPut.args[0]).to.deep.equal(['23', { foo: 'bar' }])
  })

  it('should create a delete route', async () => {
    const res = await del(`${host}/test/del/42`)
    expect(res).to.equal('del-ok')
    expect(sDel.callCount).to.equal(1)
    expect(sDel.args[0]).to.deep.equal(['42'])
  })

  it('should create a get route with custom paramMapping', async () => {
    const res = await get(`${host}/test/custom?a=1&b=2`)
    expect(res).to.equal('custom-ok')
    expect(sCustom.callCount).to.equal(1)
    expect(sCustom.args[0]).to.deep.equal(['1', '2'])
    expect(sCustomMapping.callCount).to.equal(1)
    expect(sCustomMapping.args[0]).to.have.length(1)
    expect(sCustomMapping.args[0][0]).to.be.an('object')
  })

})
