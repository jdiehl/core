import { expect } from 'chai'
import * as KoaRouter from 'koa-router'
import { Server } from 'net'
import { del, get, post, put } from 'request-promise-native'
import { stub } from 'sinon'

import { CoreModel } from '../'
import { expectRejection, mock } from './util'

describe('core-model-router', () => {
  const sFindOne = stub().returns('find-one-ok')
  const sFind = stub().returns('find-ok')
  const sInsert = stub().returns('insert-ok')
  const sUpdate = stub().returns('update-ok')
  const sDelete = stub().returns('delete-ok')

  class Model extends CoreModel {
    collectionName = 'model'
    async findOne(...args: any[]) { return sFindOne(...args) }
    async find(...args: any[]) { return sFind(...args) }
    async insert(...args: any[]) { return sInsert(...args) }
    async update(...args: any[]) { return sUpdate(...args) }
    async delete(...args: any[]) { return sDelete(...args) }
  }

  const { app, collection, services, resetHistory } = mock({}, [], { model: Model })
  let host: string

  before(async () => {
    await app.init()
    await app.listen()
    host = `http://127.0.0.1:${app.instance.address().port}`
  })

  beforeEach(() => {
    resetHistory()
    sFindOne.resetHistory()
    sFind.resetHistory()
    sInsert.resetHistory()
    sUpdate.resetHistory()
    sDelete.resetHistory()
  })

  after(async () => {
    await app.close()
  })

  it('GET / should not call find', async () => {
    await expectRejection(async () => await get(`${host}`), '404 - "Not Found"')
  })

  it('GET /model? should call find', async () => {
    const res = await get(`${host}/model?foo=bar`)
    expect(res).to.equal('find-ok')
    expect(sFind.callCount).to.equal(1)
    expect(sFind.args[0]).to.deep.equal([{ foo: 'bar' }])
  })

  it('GET /model/123 should call findOne', async () => {
    const res = await get(`${host}/model/123`)
    expect(res).to.equal('find-one-ok')
    expect(sFindOne.callCount).to.equal(1)
    expect(sFindOne.args[0]).to.deep.equal(['123'])
  })

  it('POST /model/ should call insert', async () => {
    const res = await post(`${host}/model`).json({ a: 1 })
    expect(res).to.equal('insert-ok')
    expect(sInsert.callCount).to.equal(1)
    expect(sInsert.args[0]).to.deep.equal([{ a: 1 }])
  })

  it('PUT /model/42 should call update', async () => {
    const res = await put(`${host}/model/42`).json({ b: 2 })
    expect(res).to.equal('update-ok')
    expect(sUpdate.callCount).to.equal(1)
    expect(sUpdate.args[0]).to.deep.equal(['42', { b: 2 }])
  })

  it('DELETE /model/666 should call delete', async () => {
    const res = await del(`${host}/model/123`)
    expect(res).to.equal('delete-ok')
    expect(sDelete.callCount).to.equal(1)
    expect(sDelete.args[0]).to.deep.equal(['123'])
  })

})
