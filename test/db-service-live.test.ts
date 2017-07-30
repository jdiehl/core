jest.unmock('mongodb')

import { DbService, IDbCollection } from '../'
import { mock } from './util'

describe.skip('mongo:localhost', () => {
  const { app, services, reset } = mock({ db: 'mongodb://127.0.0.1/test' }, 'db')
  const db = services.db as any as DbService
  let col: IDbCollection

  beforeAll(async () => {
    await app.init()
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    reset()
    col = db.collection('test')
  })

  afterEach(async () => {
    await db.drop('test')
  })

  test('should insert a document', async () => {
    const res = await col.insertOne({ a: 1 })
    expect(res.insertedCount).toBe(1)
    expect(res.insertedId).toBeDefined
  })

  test('should retrieve a document', async () => {
    const x = await col.insertOne({ a: { b: 2 } })
    const y = await col.findOne({ _id: x.insertedId })
    expect(y).toEqual({ _id: x.insertedId, a: { b: 2 } })
  })

  test('should find sorted documents', async () => {
    await col.insertOne({ a: 1, b: 1 })
    await col.insertOne({ a: 1, b: 2 })
    await col.insertOne({ a: 2, b: 3 })
    const x = await col.find({ a: 1 }).sort('b', 1).toArray()
    expect(x).toHaveLength(2)
    expect(x[0].b).toBe(1)
    expect(x[1].b).toBe(2)
  })

  test('should update a document', async () => {
    const x = await col.insertOne({ a: 1 })
    const y = await col.updateOne({ _id: x.insertedId }, { b: 2 })
    const z = await col.findOne({ _id: x.insertedId })
    expect(z).toEqual({ b: 2, _id: x.insertedId })
  })

  test('should delete a document', async () => {
    const x = await col.insertOne({ a: 1 })
    const y = await col.deleteOne({ _id: x.insertedId })
    expect(y.deletedCount).toBe(1)
    const z = await col.findOne({ _id: x.insertedId })
    expect(z).toBeNull
  })

})
