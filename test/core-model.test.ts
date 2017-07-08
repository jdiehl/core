import { expect } from 'chai'
import { stub } from 'sinon'

import { CoreModel } from '../'
import { mockCollection, mockCursor, mockServices, resetMockServices } from './util'

describe('core-model', () => {
  const beforeFindOne = stub()
  const beforeFind = stub()
  const beforeInsert = stub()
  const beforeUpdate = stub()
  const beforeDelete = stub()
  const transform = stub().returnsArg(0)
  let model: CoreModel
  class TestModel extends CoreModel {
    collectionName: 'test'
    async beforeFindOne(...args: any[]) { return beforeFindOne(...args) }
    async beforeFind(...args: any[]) { return beforeFind(...args) }
    async beforeInsert(...args: any[]) { return beforeInsert(...args) }
    async beforeUpdate(...args: any[]) { return beforeUpdate(...args) }
    async beforeDelete(...args: any[]) { return beforeDelete(...args) }
    async transform(obj: any) { return transform(obj) }
  }

  beforeEach(async () => {
    resetMockServices()
    beforeFindOne.resetHistory()
    beforeFind.resetHistory()
    beforeInsert.resetHistory()
    beforeUpdate.resetHistory()
    beforeDelete.resetHistory()
    transform.resetHistory()
    model = new TestModel({} as any, mockServices as any)
    await model.init()
  })

  it('findOne() should call beforeFindOne', async () => {
    await model.findOne('id')
    expect(beforeFindOne.callCount).to.equal(1)
    expect(beforeFindOne.args[0]).to.deep.equal(['id'])
  })

  it('findOne() should call transform', async () => {
    await model.findOne('id')
    expect(transform.callCount).to.equal(1)
    expect(transform.args[0]).to.deep.equal([{ _id: 'id1' }])
  })

  it('findOne() should fetch a record', async () => {
    const res = await model.findOne('id')
    expect(res).to.deep.equal({ _id: 'id1' })
    expect(mockCollection.findOne.callCount).to.equal(1)
    expect(mockCollection.findOne.args[0]).to.deep.equal([{ _id: 'id' }])
  })

  it('find() should call beforeFind', async () => {
    const a = {}
    const b = {}
    await model.find(a, b)
    expect(beforeFind.callCount).to.equal(1)
    expect(beforeFind.args[0]).to.have.length(2)
    expect(beforeFind.args[0][0]).to.equal(a)
    expect(beforeFind.args[0][1]).to.equal(b)
  })

  it('find() should call transform', async () => {
    await model.find()
    expect(transform.callCount).to.equal(2)
    expect(transform.args[0]).to.deep.equal([{ _id: 'id1' }])
    expect(transform.args[1]).to.deep.equal([{ _id: 'id2' }])
  })

  it('findOne() should fetch records', async () => {
    await model.find({ query: 'this' }, { sort: { name: 1 }, skip: 2, limit: 3, project: { key: 'no' } })
    expect(mockCollection.find.callCount).to.equal(1)
    expect(mockCollection.find.args[0]).to.deep.equal([{ query: 'this' }])
    expect(mockCursor.sort.callCount).to.equal(1)
    expect(mockCursor.sort.args[0]).to.deep.equal([{ name: 1 }])
    expect(mockCursor.skip.callCount).to.equal(1)
    expect(mockCursor.skip.args[0]).to.deep.equal([2])
    expect(mockCursor.limit.callCount).to.equal(1)
    expect(mockCursor.limit.args[0]).to.deep.equal([3])
    expect(mockCursor.project.callCount).to.equal(1)
    expect(mockCursor.project.args[0]).to.deep.equal([{ key: 'no' }])
  })

  it('insert() should call beforeInsert', async () => {
    await model.insert({ a: 1 })
    expect(beforeInsert.callCount).to.equal(1)
    expect(beforeInsert.args[0]).to.deep.equal([{ a: 1 }])
  })

  it('insert() should call transform', async () => {
    await model.insert({ a: 1 })
    expect(transform.callCount).to.equal(1)
    expect(transform.args[0]).to.deep.equal([{ a: 1, _id: 'id1' }])
  })

  it('insert() should insert a record', async () => {
    const res = await model.insert({ name: 'susan' })
    expect(res).to.deep.equal({ _id: 'id1', name: 'susan' })
    expect(mockCollection.insertOne.callCount).to.equal(1)
    expect(mockCollection.insertOne.args[0]).to.deep.equal([{ name: 'susan' }])
  })

  it('update() should call beforeUpdate', async () => {
    await model.update('id', { b: 2 })
    expect(beforeUpdate.callCount).to.equal(1)
    expect(beforeUpdate.args[0]).to.deep.equal(['id', { b: 2 }])
  })

  it('update() should update a record', async () => {
    await model.update('id', { x: 1 })
    expect(mockCollection.updateOne.callCount).to.equal(1)
    expect(mockCollection.updateOne.args[0]).to.deep.equal([{ _id: 'id' }, { $set: { x: 1 } }])
  })

  it('delete() should call beforeDelete', async () => {
    await model.delete('id')
    expect(beforeDelete.callCount).to.equal(1)
    expect(beforeDelete.args[0]).to.deep.equal(['id'])
  })

  it('delete() should delete a record', async () => {
    await model.delete('id')
    expect(mockCollection.deleteOne.callCount).to.equal(1)
    expect(mockCollection.deleteOne.args[0]).to.deep.equal([{ _id: 'id' }])
  })

})
