import { CoreModel } from '../'
import { mock } from './util'

describe('core-model', () => {
  const afterFindOne = jest.fn().mockImplementation(x => x)
  const afterFind = jest.fn().mockImplementation(x => x)
  const afterInsert = jest.fn().mockImplementation(x => x)
  const afterUpdate = jest.fn()
  const afterDelete = jest.fn()
  const beforeFindOne = jest.fn()
  const beforeFind = jest.fn().mockImplementation(x => x)
  const beforeInsert = jest.fn().mockImplementation(x => x)
  const beforeUpdate = jest.fn().mockImplementation((x, y) => y)
  const beforeDelete = jest.fn()
  const transform = jest.fn().mockImplementation(x => x)

  class TestModel extends CoreModel {
    collectionName: 'test'
    async afterFindOne(...args: any[]) { return afterFindOne(...args) }
    async afterFind(...args: any[]) { return afterFind(...args) }
    async afterInsert(...args: any[]) { return afterInsert(...args) }
    async afterUpdate(...args: any[]) { return afterUpdate(...args) }
    async afterDelete(...args: any[]) { return afterDelete(...args) }
    async beforeFindOne(...args: any[]) { return beforeFindOne(...args) }
    async beforeFind(...args: any[]) { return beforeFind(...args) }
    async beforeInsert(...args: any[]) { return beforeInsert(...args) }
    async beforeUpdate(...args: any[]) { return beforeUpdate(...args) }
    async beforeDelete(...args: any[]) { return beforeDelete(...args) }
    async transform(obj: any) { return transform(obj) }
  }

  const { app, cursor, collection, services, reset } = mock({}, [], { model: TestModel })
  const model = (services as any).model as CoreModel

  beforeAll(async () => {
    await app.init()
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    reset()
    afterFindOne.mockClear()
    afterFind.mockClear()
    afterInsert.mockClear()
    afterUpdate.mockClear()
    afterDelete.mockClear()
    beforeFindOne.mockClear()
    beforeFind.mockClear()
    beforeInsert.mockClear()
    beforeUpdate.mockClear()
    beforeDelete.mockClear()
    transform.mockClear()
  })

  it('findOne() should call beforeFindOne', async () => {
    await model.findOne('id')
    expect(beforeFindOne).toHaveBeenCalledTimes(1)
    expect(beforeFindOne).toHaveBeenCalledWith('id')
  })

  it('findOne() should call afterFindOne', async () => {
    await model.findOne('id')
    expect(afterFindOne).toHaveBeenCalledTimes(1)
    expect(afterFindOne).toHaveBeenCalledWith({ _id: 'id1' })
  })

  it('findOne() should call transform', async () => {
    await model.findOne('id')
    expect(transform).toHaveBeenCalledTimes(1)
    expect(transform).toHaveBeenCalledWith({ _id: 'id1' })
  })

  it('findOne() should fetch a record', async () => {
    const res = await model.findOne('id')
    expect(res).toEqual({ _id: 'id1' })
    expect(collection.findOne).toHaveBeenCalledTimes(1)
    expect(collection.findOne).toHaveBeenCalledWith({ _id: 'id' })
  })

  it('find() should call beforeFind', async () => {
    const a = { foo: 'bar' }
    const b = { skip: 3 }
    await model.find(a, b)
    expect(beforeFind).toHaveBeenCalledTimes(1)
    expect(beforeFind).toHaveBeenLastCalledWith(a, b)
  })

  it('find() should call afterFind', async () => {
    await model.find()
    expect(afterFind).toHaveBeenCalledTimes(1)
    expect(afterFind).toHaveBeenCalledWith([{ _id: 'id1' }, { _id: 'id2' }])
  })

  it('find() should call transform', async () => {
    await model.find()
    expect(transform).toHaveBeenCalledTimes(2)
    expect(transform.mock.calls[0]).toEqual([{ _id: 'id1' }])
    expect(transform.mock.calls[1]).toEqual([{ _id: 'id2' }])
  })

  it('findOne() should fetch records', async () => {
    await model.find({ query: 'this' }, { sort: { name: 1 }, skip: 2, limit: 3, project: { key: 'no' } })
    expect(collection.find).toHaveBeenCalledTimes(1)
    expect(collection.find).toHaveBeenCalledWith({ query: 'this' })
    expect(cursor.sort).toHaveBeenCalledTimes(1)
    expect(cursor.sort).toHaveBeenCalledWith({ name: 1 })
    expect(cursor.skip).toHaveBeenCalledTimes(1)
    expect(cursor.skip).toHaveBeenCalledWith(2)
    expect(cursor.limit).toHaveBeenCalledTimes(1)
    expect(cursor.limit).toHaveBeenCalledWith(3)
    expect(cursor.project).toHaveBeenCalledTimes(1)
    expect(cursor.project).toHaveBeenCalledWith({ key: 'no' })
  })

  it('insert() should call beforeInsert', async () => {
    await model.insert({ a: 1 })
    expect(beforeInsert).toHaveBeenCalledTimes(1)
    expect(beforeInsert).toHaveBeenCalledWith({ a: 1 })
  })

  it('insert() should call afterInsert', async () => {
    await model.insert({ a: 1 })
    expect(afterInsert).toHaveBeenCalledTimes(1)
    expect(afterInsert).toHaveBeenCalledWith({ _id: 'id1', a: 1 })
  })

  it('insert() should call transform', async () => {
    await model.insert({ a: 1 })
    expect(transform).toHaveBeenCalledTimes(1)
    expect(transform).toHaveBeenCalledWith({ _id: 'id1', a: 1 })
  })

  it('insert() should insert a record', async () => {
    const res = await model.insert({ name: 'susan' })
    expect(res).toEqual({ _id: 'id1', name: 'susan' })
    expect(collection.insertOne).toHaveBeenCalledTimes(1)
    expect(collection.insertOne).toHaveBeenCalledWith({ name: 'susan' })
  })

  it('update() should call beforeUpdate', async () => {
    await model.update('id', { b: 2 })
    expect(beforeUpdate).toHaveBeenCalledTimes(1)
    expect(beforeUpdate).toHaveBeenCalledWith('id', { b: 2 })
  })

  it('update() should call afterUpdate', async () => {
    await model.update('id', { b: 2 })
    expect(afterUpdate).toHaveBeenCalledTimes(1)
    expect(afterUpdate).toHaveBeenCalledWith('id', { b: 2 })
  })

  it('update() should update a record', async () => {
    await model.update('id', { x: 1 })
    expect(collection.updateOne).toHaveBeenCalledTimes(1)
    expect(collection.updateOne).toHaveBeenCalledWith({ _id: 'id' }, { $set: { x: 1 } })
  })

  it('delete() should call beforeDelete', async () => {
    await model.delete('id')
    expect(beforeDelete).toHaveBeenCalledTimes(1)
    expect(beforeDelete).toHaveBeenCalledWith('id')
  })

  it('delete() should call afterDelete', async () => {
    await model.delete('id')
    expect(afterDelete).toHaveBeenCalledTimes(1)
    expect(afterDelete).toHaveBeenCalledWith('id')
  })

  it('delete() should delete a record', async () => {
    await model.delete('id')
    expect(collection.deleteOne).toHaveBeenCalledTimes(1)
    expect(collection.deleteOne).toHaveBeenCalledWith({ _id: 'id' })
  })

})
