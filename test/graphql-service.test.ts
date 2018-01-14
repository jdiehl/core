jest.unmock('request-promise-native')

import { defaults as makeRequest } from 'request-promise-native'
const request = makeRequest({ json: true, resolveWithFullResponse: true, simple: false })

import { GraphQLService, IGraphQLConfig } from '../src'
import { mock, mockReject } from './util'

const config: IGraphQLConfig = { graphiql: false, models: ['test']  }
const { app, model, services, reset } = mock({ graphql: config }, ['graphql', 'router', 'server'])
const graphql = services.graphql as any as GraphQLService
let host: string

async function query(queryString: string, variables?: any): Promise<any> {
  const body = { query: queryString, variables }
  const res = await request.post(host + 'graphql', { body })
  if (res.body.errors) throw new Error(res.body.errors.map(e => e.message).join(''))
  return res.body.data
}

beforeAll(async () => {
  await app.init()
  host = `http://127.0.0.1:${app.port}/`
})

afterAll(async () => {
  await app.destroy()
})

afterEach(() => {
  reset()
})

test('should perform a find', async () => {
  const res = await query(`{ models { _id } }`)
  expect(res).toEqual({ models: [ { _id: 'id1' }, { _id: 'id2' } ] })
  expect(model.find).toBeCalled
  expect(model.find).toBeCalledWith()
})

test('should perform a findOne', async () => {
  const res = await query(`{ model(_id: "id1") { _id } }`)
  expect(res).toEqual({ model: { _id: 'id1' } })
  expect(model.findOne).toBeCalled
  expect(model.findOne).toBeCalledWith('id1')
})

test('should perform an insert', async () => {
  const res = await query(`mutation { insertModel { _id } }`)
  expect(res).toEqual({ insertModel: { _id: 'id1' } })
  expect(model.insert).toBeCalled
  expect(model.insert).toBeCalledWith({})
})

test('should perform an update', async () => {
  const res = await query(`mutation { updateModel(_id: "id1") }`)
  expect(res).toEqual({ updateModel: true })
  expect(model.update).toBeCalled
  expect(model.update).toBeCalledWith('id1', {})
})

test('should perform a delete', async () => {
  const res = await query(`mutation { deleteModel(_id: "id1") }`)
  expect(res).toEqual({ deleteModel: true })
  expect(model.delete).toBeCalled
  expect(model.delete).toBeCalledWith('id1')
})
