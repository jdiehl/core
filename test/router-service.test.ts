import { expect } from 'chai'
import * as Koa from 'koa'
import * as KoaRouter from 'koa-router'
import { Server } from 'net'
import { del, get, post, put } from 'request-promise-native'
import { stub } from 'sinon'

import { CoreService, Delete, Get, Post, Put, Router, RouterService } from '../'
import { expectRejection, mockServer } from './util'

describe('router', () => {
  let service: CoreService
  let server: Server
  let host: string
  const sBefore = stub()
  const sAfter = stub().returnsArg(2)
  const sGet = stub().returns('get-ok')
  const sGetMore = stub().returns('get-more-ok')
  const sPost = stub().returns('post-ok')
  const sPut = stub().returns('put-ok')
  const sDel = stub().returns('del-ok')
  const sCustom = stub().returns('custom-ok')
  const sCustomMapping = stub().returns(['query.a', 'query.b'])

  @Router({ prefix: '/test', redirect: { '/a': '/b' } })
  class Service extends CoreService {
    before(...args: any[]) { return sBefore.apply(null, args) }
    after(...args: any[]) { return sAfter.apply(null, args) }
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
    sBefore.resetHistory()
    sAfter.resetHistory()
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

  it('should call before', async () => {
    const res = await get(`${host}/test/get/more?x=a&y=b`)
    expect(sBefore.callCount).to.equal(1)
    expect(sBefore.args[0].length).to.equal(3)
    expect(sBefore.args[0][0]).to.be.an('object')
    expect(sBefore.args[0][1]).to.equal('getMore')
    expect(sBefore.args[0][2]).to.deep.equal(['more', { x: 'a', y: 'b' }])
  })

  it('should stop if before is rejected', async () => {
    sBefore.rejects({ status: 401, message: 'Unauthorized' })
    await expectRejection(() => get(`${host}/test/get`), '401 - "Unauthorized"')
    expect(sGet.callCount).to.equal(0)
    sBefore.resolves()
  })

  it('should call after', async () => {
    const res = await post(`${host}/test/post`)
    expect(sAfter.callCount).to.equal(1)
    expect(sAfter.args[0].length).to.equal(3)
    expect(sAfter.args[0][0]).to.be.an('object')
    expect(sAfter.args[0][1]).to.equal('post')
    expect(sAfter.args[0][2]).to.equal('post-ok')
  })

  it('after should transform the result', async () => {
    sAfter.returnsArg(1)
    const res = await put(`${host}/test/put/3`)
    expect(res).to.equal('put')
    sAfter.returnsArg(2)
  })

  it('should call before and after in order', async () => {
    const res = await del(`${host}/test/del/42`)
    expect(sBefore.calledBefore(sDel)).to.be.true
    expect(sDel.calledBefore(sAfter)).to.be.true
  })

})
