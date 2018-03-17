jest.mock('mongodb')

import { DbService, IDbCollection, IDbConfig } from '../src'
import { mock } from './util'

const config = { server: 'mongodb://host/db'}
const { app, services } = mock({ db: config }, 'db')
const db = services.db as any as DbService
let col: IDbCollection
let mongo: any

beforeAll(async () => {
  mongo = require('mongodb')
  await app.init()
  col = db.collection('test')
})

afterAll(async () => {
  await app.destroy()
})

afterEach(async () => {
  mongo.__reset()
})

test('should connect to the database server and open a collection', async () => {
  expect(mongo.connect).toHaveBeenCalledTimes(1)
  expect(mongo.connect).toHaveBeenCalledWith('mongodb://host/db')
  expect(mongo.__db.collection).toHaveBeenCalledTimes(1)
  expect(mongo.__db.collection).toHaveBeenCalledWith('test')
  expect(col).toBe(mongo.__collection)
})

test('should close the database connection', async () => {
  db.destroy()
  expect(mongo.__db.close).toHaveBeenCalledTimes(1)
})

test('should drop a collection', async () => {
  db.drop('foo')
  expect(mongo.__db.dropCollection).toHaveBeenCalledTimes(1)
  expect(mongo.__db.dropCollection).toHaveBeenCalledWith('foo')
})
