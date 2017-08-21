import { CoreModel } from '../'
import { mock } from './util'

describe('core-model', () => {
  const transform = jest.fn().mockImplementation(x => x)

  class TestModel extends CoreModel {
    collectionName = 'test'
    spec = { name: 'string' } as any
    transform(obj: any) { return transform(obj) }
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
    transform.mockClear()
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

  test('insert() should call validate', async () => {
    await model.insert({ name: 'test' })
    expect(services.validation.validate).toHaveBeenCalledTimes(1)
    expect(services.validation.validate).toHaveBeenCalledWith({ name: 'string' }, { name: 'test' }, false)
  })

  it('update() should update a record', async () => {
    await model.update('id', { x: 1 })
    expect(collection.updateOne).toHaveBeenCalledTimes(1)
    expect(collection.updateOne).toHaveBeenCalledWith({ _id: 'id' }, { $set: { x: 1 } })
  })

  test('update() should call validate', async () => {
    await model.update('id', { name: 'new' })
    expect(services.validation.validate).toHaveBeenCalledTimes(1)
    expect(services.validation.validate).toHaveBeenCalledWith({ name: 'string' }, { name: 'new' }, true)
  })

  test('insert() and update() should reject invalid objects', async () => {
    services.validation.validate.mockReturnValue(false)
    await expect(model.insert({ name: 'test' })).rejects.toMatchObject({ status: 400 })
    await expect(model.update('id', { name: 'test' })).rejects.toMatchObject({ status: 400 })
    services.validation.validate.mockReturnValue(true)
  })

  it('delete() should delete a record', async () => {
    await model.delete('id')
    expect(collection.deleteOne).toHaveBeenCalledTimes(1)
    expect(collection.deleteOne).toHaveBeenCalledWith({ _id: 'id' })
  })

})
