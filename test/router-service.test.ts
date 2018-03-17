jest.unmock('request-promise-native')

import { defaults as makeRequest } from 'request-promise-native'

import { CoreService, Model } from '../src'
import { mock, mockReject } from './util'

const request = makeRequest({ json: true, resolveWithFullResponse: true, simple: false })

class Service extends CoreService {
  get = jest.fn(context => context.body = { foo: 'bar' })
  async init() {
    const router = this.services.router.add('/test')
    router.get('/', this.get)
    const m = this.services.model.add('model')
    this.services.router.addModel('/model', m)
  }
}

const { app, model, reset } = mock({ router: {} }, ['router', 'server'], { service: Service })
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
  reset()
  service.get.mockClear()
})

test('should not create a get route without the prefix', async () => {
  const res = await request.get(host)
  expect(res.statusCode).toBe(404)
})

test('should create a get route', async () => {
  const res = await request.get(`${host}/test`)
  expect(res.statusCode).toBe(200)
  expect(res.body).toEqual({ foo: 'bar' })
  expect(service.get).toHaveBeenCalledTimes(1)
})

test('should create a model find route', async () => {
  const res = await request.get(`${host}/model`)
  expect(res.statusCode).toBe(200)
  expect(res.body).toEqual([ { _id: 'id1' }, { _id: 'id2' }])
  expect(model.find).toHaveBeenCalledTimes(1)
})

test('should create a model findOne route', async () => {
  const res = await request.get(`${host}/model/id1`)
  expect(res.statusCode).toBe(200)
  expect(res.body).toEqual({ _id: 'id1' })
  expect(model.findOne).toHaveBeenCalledTimes(1)
  expect(model.findOne).toHaveBeenCalledWith('id1')
})

test('should create a model insert route', async () => {
  const res = await request.post({ url: `${host}/model`, body: { foo: 'bar' } })
  expect(res.statusCode).toBe(200)
  expect(res.body).toEqual({ _id: 'id1' })
  expect(model.insert).toHaveBeenCalledTimes(1)
  expect(model.insert).toHaveBeenCalledWith({ foo: 'bar' })
})

test('should create a model update route', async () => {
  const res = await request.put({ url: `${host}/model/id1`, body: { up: 1 } })
  expect(res.statusCode).toBe(204)
  expect(model.update).toHaveBeenCalledTimes(1)
  expect(model.update).toHaveBeenCalledWith('id1', { up: 1 })
})

test('should create a model delete route', async () => {
  const res = await request.delete(`${host}/model/id1`)
  expect(res.statusCode).toBe(204)
  expect(model.delete).toHaveBeenCalledTimes(1)
  expect(model.delete).toHaveBeenCalledWith('id1')
})
