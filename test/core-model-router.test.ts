jest.unmock('request-promise-native')

import { del, get, post, put } from 'request-promise-native'

import { CoreModel } from '../'
import { mock } from './util'

describe('core-model-router', () => {
  const sFindOne = jest.fn().mockReturnValue('find-one-ok')
  const sFind = jest.fn().mockReturnValue('find-ok')
  const sInsert = jest.fn().mockReturnValue('insert-ok')
  const sUpdate = jest.fn().mockReturnValue('update-ok')
  const sDelete = jest.fn().mockReturnValue('delete-ok')

  class Model extends CoreModel {
    collectionName = 'model'
    async findOne(...args: any[]) { return sFindOne(...args) }
    async find(...args: any[]) { return sFind(...args) }
    async insert(...args: any[]) { return sInsert(...args) }
    async update(...args: any[]) { return sUpdate(...args) }
    async delete(...args: any[]) { return sDelete(...args) }
  }

  const { app, collection, services, reset } = mock({}, [], { model: Model })
  let host: string

  beforeAll(async () => {
    await app.init()
    await app.listen()
    host = `http://127.0.0.1:${app.instance.address().port}`
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(() => {
    reset()
    sFindOne.mockClear()
    sFind.mockClear()
    sInsert.mockClear()
    sUpdate.mockClear()
    sDelete.mockClear()
  })

  it('GET / should not call find', async () => {
    await expect(get(`${host}`)).rejects.toMatchObject({ statusCode: 404 })
  })

  it('GET /model? should call find', async () => {
    const res = await get(`${host}/model?foo=bar`)
    expect(res).toBe('find-ok')
    expect(sFind).toHaveBeenCalledTimes(1)
    expect(sFind).toHaveBeenCalledWith({ foo: 'bar' })
  })

  it('GET /model/123 should call findOne', async () => {
    const res = await get(`${host}/model/123`)
    expect(res).toBe('find-one-ok')
    expect(sFindOne).toHaveBeenCalledTimes(1)
    expect(sFindOne).toHaveBeenCalledWith('123')
  })

  it('POST /model/ should call insert', async () => {
    const res = await post(`${host}/model`).json({ a: 1 })
    expect(res).toBe('insert-ok')
    expect(sInsert).toHaveBeenCalledTimes(1)
    expect(sInsert).toHaveBeenCalledWith({ a: 1 })
  })

  it('PUT /model/42 should call update', async () => {
    const res = await put(`${host}/model/42`).json({ b: 2 })
    expect(res).toBe('update-ok')
    expect(sUpdate).toHaveBeenCalledTimes(1)
    expect(sUpdate).toHaveBeenCalledWith('42', { b: 2 })
  })

  it('DELETE /model/666 should call delete', async () => {
    const res = await del(`${host}/model/123`)
    expect(res).toBe('delete-ok')
    expect(sDelete).toHaveBeenCalledTimes(1)
    expect(sDelete).toHaveBeenCalledWith('123')
  })

})
