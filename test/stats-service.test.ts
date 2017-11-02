import { IStatsConfig, StatsService } from '../src'
import { IMock, mock, MockCollection, mockResolve } from './util'

const config: IStatsConfig = { collection: 'test', includeHeader: ['bar'] }
let m: IMock
let collection: MockCollection
let stats: StatsService

beforeEach(async () => {
  m = mock({ stats: config }, 'stats')
  collection = m.collection
  stats = m.services.stats as any as StatsService
  await m.app.init()
})

afterEach(async () => {
  await m.app.destroy()
})

test('should request a collection', async () => {
  expect(m.services.db.collection).toHaveBeenCalledTimes(1)
  expect(m.services.db.collection).toHaveBeenCalledWith('test')
})

test('should install a middleware', async () => {
  const use = jest.fn()
  stats.install({ use } as any)
  expect(use).toHaveBeenCalledTimes(1)
})

test('should call stats.store() from the middleware', async () => {
  let middleware: any
  const use = (f: any) => middleware = f
  const store = jest.fn(mockResolve())
  stats.store = store
  stats.install({ use } as any)
  const context = {}
  await middleware(context, async () => {})
  expect(store).toHaveBeenCalledTimes(1)
  expect(store).toHaveBeenCalledWith(context, expect.any(Date), expect.any(Number))
})

test('should not call stats.store() from the middleware on an error', async () => {
  const use = jest.fn()
  const store = jest.fn(mockResolve())
  stats.store = store
  stats.install({ use } as any)
  const middleware = use.mock.calls[0][0]
  const error = new Error()
  await expect(middleware({}, async () => { throw error })).rejects.toEqual(error)
  expect(store).toHaveBeenCalledTimes(0)
})

test('store() should insert a document', async () => {
  const context = mockContext()
  const date = new Date()
  const time = 24
  const doc = mockStatsDoc(context, date, time)
  await stats.store(context, date, time)
  expect(collection.insertOne).toHaveBeenCalledTimes(1)
  expect(collection.insertOne).toHaveBeenCalledWith(doc)
})

test('store() should store params', async () => {
  const context = mockContext('DELETE', '/test/3', { id: 3 })
  const date = new Date()
  const time = 24
  const doc = mockStatsDoc(context, date, time)
  await stats.store(context, date, time)
  expect(collection.insertOne).toHaveBeenCalledWith(doc)
})

test('store() should store a query', async () => {
  const context = mockContext('GET', '/test/4', {}, { sort: 1 })
  const date = new Date()
  const time = 24
  const doc = mockStatsDoc(context, date, time)
  await stats.store(context, date, time)
  expect(collection.insertOne).toHaveBeenCalledWith(doc)
})

test('store() should store the user', async () => {
  const context = mockContext('PUT', '/test1', {}, {}, { foo: 'bar' }, { _id: 'user' })
  const date = new Date()
  const time = 42
  const doc = mockStatsDoc(context, date, time)
  await stats.store(context, date, time)
  expect(collection.insertOne).toHaveBeenCalledWith(doc)
})

test('store() should mask passwords', async () => {
  const context = mockContext('POST', '/test2', {}, {}, { email: 'a@b.c', password: 'hello' })
  const date = new Date()
  const time = 42
  const doc = mockStatsDoc(context, date, time)
  await stats.store(context, date, time)
  expect(collection.insertOne).toHaveBeenCalledWith(doc)
})

test('store() should include a header field', async () => {
  const context = mockContext('GET', '/', {}, undefined, undefined, undefined, { bar: 'myHeader '})
  const date = new Date()
  const time = 42
  const doc = mockStatsDoc(context, date, time)
  await stats.store(context, date, time)
  expect(collection.insertOne).toHaveBeenCalledWith(doc)
})

function mockContext(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  path: string = '/',
  params: any = {},
  query: any = {},
  body?: any,
  user?: any,
  header: Record<string, string> = {}
): any {
  return { method, path, params, query, request: { body }, user, header }
}

function mockStatsDoc(context: any, date: Date, time: number): any {
  return {
    body: context.request.body,
    date,
    header: context.header,
    method: context.method,
    params: context.params,
    path: context.path,
    query: context.query,
    time,
    userId: context.user ? context.user._id : undefined
  }
}
