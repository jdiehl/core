jest.mock('mongodb')

import { DbService, IDbCollection } from '../'
import { mock } from './util'

const { app, services } = mock({ db: 'mongodb://host/db' }, 'db')
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
  expect(mongo.MongoClient.connect).toHaveBeenCalledTimes(1)
  expect(mongo.MongoClient.connect).toHaveBeenCalledWith('mongodb://host/db')
  expect(mongo.__client.collection).toHaveBeenCalledTimes(1)
  expect(mongo.__client.collection).toHaveBeenCalledWith('test')
  expect(col).toBe(mongo.__collection)
})

test('should close the database connection', async () => {
  db.destroy()
  expect(mongo.__client.close).toHaveBeenCalledTimes(1)
})

test('should drop a collection', async () => {
  db.drop('foo')
  expect(mongo.__client.dropCollection).toHaveBeenCalledTimes(1)
  expect(mongo.__client.dropCollection).toHaveBeenCalledWith('foo')
})
