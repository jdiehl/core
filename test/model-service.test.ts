import { ErrorBadRequest, Model } from '../src'
import { mock } from './util'

describe('model-service', () => {
  const { app, cursor, collection, services, reset } = mock({}, ['model'])
  const modelService = services.model
  const validator = services.validation.validator()
  services.validation.validator.mockClear()
  let model: Model

  beforeAll(async () => {
    await app.init()
    model = modelService.add('test', { name: 'string' })
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    reset()
    validator.mockClear()
  })

  test('add() should create a validator', async () => {
    const spec = { name: 'string' }
    modelService.add('test2', spec)
    expect(services.validation.validator).toHaveBeenCalledTimes(1)
    expect(services.validation.validator).toHaveBeenCalledWith(spec)
  })

  it('findOne() should fetch a record', async () => {
    const res = await model.findOne('id')
    expect(res).toEqual({ _id: 'id1' })
    expect(collection.findOne).toHaveBeenCalledTimes(1)
    expect(collection.findOne).toHaveBeenCalledWith({ _id: 'id' })
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

  it('insert() should insert a record', async () => {
    const res = await model.insert({ name: 'susan' })
    expect(res).toEqual({ _id: 'id1', name: 'susan' })
    expect(collection.insertOne).toHaveBeenCalledTimes(1)
    expect(collection.insertOne).toHaveBeenCalledWith({ name: 'susan' })
  })

  test('insert() should call the validator', async () => {
    const res = await model.insert({ name: 'test' })
    expect(validator).toHaveBeenCalledTimes(1)
    expect(validator).toHaveBeenCalledWith({ name: 'test' }, false)
  })

  test('update() should update a record', async () => {
    await model.update('id', { x: 1 })
    expect(collection.updateOne).toHaveBeenCalledTimes(1)
    expect(collection.updateOne).toHaveBeenCalledWith({ _id: 'id' }, { $set: { x: 1 } })
  })

  test('update() should call the validator', async () => {
    await model.update('id', { name: 'new' })
    expect(validator).toHaveBeenCalledTimes(1)
    expect(validator).toHaveBeenCalledWith({ name: 'new' }, true)
  })

  test('insert() and update() should reject invalid objects', async () => {
    validator.mockReturnValue(false)
    await expect(model.insert({ name: 'test' })).rejects.toBeInstanceOf(ErrorBadRequest)
    await expect(model.update('id', { name: 'test' })).rejects.toBeInstanceOf(ErrorBadRequest)
    validator.mockReturnValue(true)
  })

  it('delete() should delete a record', async () => {
    await model.delete('id')
    expect(collection.deleteOne).toHaveBeenCalledTimes(1)
    expect(collection.deleteOne).toHaveBeenCalledWith({ _id: 'id' })
  })

})
