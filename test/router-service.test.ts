jest.unmock('request-promise-native')

import * as KoaRouter from 'koa-router'
import { defaults as makeRequest } from 'request-promise-native'

import { CoreService, Delete, Get, Post, Put, Router } from '../src'
import { mock, mockReject } from './util'

const requestWithResponse = makeRequest({ json: true, resolveWithFullResponse: true, simple: false })
const { del, get, post, put } = makeRequest({ json: true })

const sBefore = jest.fn()
const sAfter = jest.fn()
const sGet = jest.fn()
const sGetMore = jest.fn()
const sPost = jest.fn()
const sPut = jest.fn()
const sDel = jest.fn()
const sCustom = jest.fn()
const sCustomMapping = jest.fn().mockReturnValue([])

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

const { app, collection, services, reset } = mock({}, ['router', 'server'], { service: Service })
const service: Service = (app.services as any).service
let host: string

beforeAll(async () => {
  await app.init()
  host = `http://127.0.0.1:${app.port}`
})

afterAll(async () => {
  await app.destroy()
})

beforeEach(() => {
  sBefore.mockReset()
  sAfter.mockImplementation((a, b, c) => c).mockClear()
  sGet.mockReturnValue('get-ok').mockClear()
  sGetMore.mockReturnValue('get-more-ok').mockClear()
  sPost.mockReturnValue('post-ok').mockClear()
  sPut.mockReturnValue('put-ok').mockClear()
  sDel.mockReturnValue('del-ok').mockClear()
  sCustom.mockReturnValue('custom-ok').mockClear()
  sCustomMapping.mockReturnValue(['foo', 'bar']).mockClear()
})

test('should create a router', () => {
  expect(service.router).toBeInstanceOf(KoaRouter)
})

test('get() should not call a method', async () => {
  const res = await requestWithResponse.get(host)
  expect(res.statusCode).toBe(404)
  expect(sGet).toHaveBeenCalledTimes(0)
  expect(sGetMore).toHaveBeenCalledTimes(0)
  expect(sPost).toHaveBeenCalledTimes(0)
  expect(sPut).toHaveBeenCalledTimes(0)
  expect(sDel).toHaveBeenCalledTimes(0)
})

test('get() should prefix the routes', async () => {
  const res = await requestWithResponse.get(`${host}/get`)
  expect(res.statusCode).toBe(404)
})

test('get() should redirect', async () => {
  const res = await requestWithResponse.get(`${host}/test/a`, { followRedirect: false })
  expect(res.statusCode).toBe(301)
  expect(res.headers.location).toBe('/b')
})

test('should create a get route', async () => {
  const context = { req: expect.anything(), res: expect.anything(), params: expect.anything() }
  const res = await get(`${host}/test/get`)
  expect(res).toBe('get-ok')
  expect(sGet).toHaveBeenCalledTimes(1)
  expect(sGet).toHaveBeenCalledWith(expect.objectContaining(context))
})

test('should create a get route with parameters', async () => {
  const res = await get(`${host}/test/get/more?x=a&y=b`)
  expect(res).toBe('get-more-ok')
  expect(sGetMore).toHaveBeenCalledTimes(1)
  expect(sGetMore).toHaveBeenLastCalledWith('more', { x: 'a', y: 'b' })
})

test('should create a post route', async () => {
  const res = await post(`${host}/test/post`).json({ a: 1, b: [2] })
  expect(res).toBe('post-ok')
  expect(sPost).toHaveBeenCalledTimes(1)
  expect(sPost).toHaveBeenLastCalledWith({ a: 1, b: [2] })
})

test('should create a put route', async () => {
  const res = await put(`${host}/test/put/23`).json({ foo: 'bar' })
  expect(res).toBe('put-ok')
  expect(sPut).toHaveBeenCalledTimes(1)
  expect(sPut).toHaveBeenLastCalledWith('23', { foo: 'bar' })
})

test('should create a delete route', async () => {
  const res = await del(`${host}/test/del/42`)
  expect(res).toBe('del-ok')
  expect(sDel).toHaveBeenCalledTimes(1)
  expect(sDel).toHaveBeenLastCalledWith('42')
})

test('should create a get route with custom paramMapping', async () => {
  const res = await get(`${host}/test/custom?a=1&b=2`)
  expect(res).toBe('custom-ok')
  expect(sCustom).toHaveBeenCalledTimes(1)
  expect(sCustom).toHaveBeenLastCalledWith('foo', 'bar')
  expect(sCustomMapping).toHaveBeenCalledTimes(1)
  expect(sCustomMapping).toHaveBeenCalledWith(expect.any(Object))
})

test('should call before', async () => {
  const res = await get(`${host}/test/get/more?x=a&y=b`)
  expect(sBefore).toHaveBeenCalledTimes(1)
  expect(sBefore).toHaveBeenCalledWith(expect.any(Object), 'getMore', ['more', { x: 'a', y: 'b' }])
})

test('should stop if before is rejected', async () => {
  sBefore.mockImplementation(mockReject({ status: 401, message: 'Unauthorized' }))
  const res = await requestWithResponse.get(`${host}/test/get`)
  expect(res.statusCode).toBe(401)
  expect(sGet).toHaveBeenCalledTimes(0)
})

test('should call after', async () => {
  const res = await post(`${host}/test/post`)
  expect(sAfter).toHaveBeenCalledTimes(1)
  expect(sAfter).toHaveBeenCalledWith(expect.any(Object), 'post', 'post-ok')
})

test('after should transform the result', async () => {
  sAfter.mockImplementation((a, b) => b)
  const res = await put(`${host}/test/put/3`)
  expect(res).toBe('put')
})
