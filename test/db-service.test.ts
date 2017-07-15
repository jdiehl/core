import { expect } from 'chai'
import { MongoClient } from 'mongodb'
import { SinonStub, stub } from 'sinon'

import { DbService, IDbCollection } from '../'
import { mock } from './util'

function runLiveTests(config: string) {
  const { services, resetHistory } = mock()
  let db: DbService
  let col: IDbCollection

  beforeEach(async () => {
    resetHistory()
    db = new DbService({ db: config } as any, services as any)
    await db.beforeInit()
    col = db.collection('test')
  })

  afterEach(async () => {
    db.drop('test')
  })

  it('should insert a document', async () => {
    const res = await col.insertOne({ a: 1 })
    expect(res.insertedCount).to.equal(1)
    expect(res.insertedId).to.be.a('object')
  })

  it('should retrieve a document', async () => {
    const x = await col.insertOne({ a: { b: 2 } })
    const y = await col.findOne({ _id: x.insertedId })
    expect(y).to.deep.equal({ _id: x.insertedId, a: { b: 2 } })
  })

  it('should find sorted documents', async () => {
    await col.insertOne({ a: 1, b: 1 })
    await col.insertOne({ a: 1, b: 2 })
    await col.insertOne({ a: 2, b: 3 })
    const x = await col.find({ a: 1 }).sort('b', 1).toArray()
    expect(x).to.have.length(2)
    expect(x[0].b).to.equal(1)
    expect(x[1].b).to.equal(2)
  })

  it('should update a document', async () => {
    const x = await col.insertOne({ a: 1 })
    const y = await col.updateOne({ _id: x.insertedId }, { b: 2 })
    expect(y.modifiedCount).to.equal(1)
    const z = await col.findOne({ _id: x.insertedId })
    expect(z).to.deep.equal({ b: 2, _id: x.insertedId })
  })

  it('should delete a document', async () => {
    const x = await col.insertOne({ a: 1 })
    const y = await col.deleteOne({ _id: x.insertedId })
    expect(y.deletedCount).to.equal(1)
    const z = await col.findOne({ _id: x.insertedId })
    expect(z).to.be.null
  })

}

describe('db-service', () => {

  describe.skip('mongo:localhost', () => runLiveTests('mongodb://127.0.0.1/test'))

  describe('mongo', () => {
    const mongoConnect = MongoClient.connect
    const collection = stub().resolves('ok')
    const connect = stub().resolves({ collection })

    before(() => {
      MongoClient.connect = connect
    })

    beforeEach(() => {
      collection.resetHistory()
      connect.resetHistory()
    })

    after(() => {
      MongoClient.connect = mongoConnect
    })

    it('beforeInit() should connect to the database server', async () => {
      const mongo = new DbService({ db: 'mongodb://host/db' } as any, [] as any)
      await mongo.beforeInit()
      expect(connect.callCount).to.equal(1)
      expect(connect.args[0]).to.deep.equal(['mongodb://host/db'])
    })

    it('collection() should fetch a collection from the database server', async () => {
      const mongo = new DbService({ db: 'mongodb://host/db' } as any, [] as any)
      await mongo.beforeInit()
      const res = await mongo.collection('something')
      expect(res).to.equal('ok')
      expect(collection.callCount).to.equal(1)
      expect(collection.args[0]).to.deep.equal(['something'])
    })

  })

})
