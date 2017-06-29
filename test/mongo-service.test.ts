import { expect } from 'chai'
import { MongoClient } from 'mongodb'
import { SinonStub, stub } from 'sinon'

import { MongoService } from '../'

describe('mongo-service', () => {
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
    const mongo = new MongoService({ database: 'test' } as any, [] as any)
    await mongo.beforeInit()
    expect(connect.calledOnce).to.be.true
    expect(connect.calledWith('test')).to.be.true
  })

  it('collection() should fetch a collection from the database server', async () => {
    const mongo = new MongoService({ database: 'test' } as any, [] as any)
    await mongo.beforeInit()
    const res = await mongo.collection('something')
    expect(res).to.equal('ok')
    expect(collection.calledOnce).to.be.true
    expect(collection.calledWith('something')).to.be.true
  })

})
