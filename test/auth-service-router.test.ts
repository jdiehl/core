import { expect } from 'chai'
import { del, get, post, put } from 'request-promise-native'
import { stub } from 'sinon'

import { CoreApp } from '../'
import { expectRejection } from './util'

class App extends CoreApp {
  customServices = []
}

describe.skip('auth-router', () => {
  let app: App
  let host: string

  beforeEach(async () => {
    app = new App({})
    await app.init()
    await app.listen()
    host = `http://127.0.0.1:${app.port}`
  })

  after(async () => {
    await app.close()
  })

  it('should create a get route', async () => {
    const res = await get(`${host}/test/get`)
    expect(res).to.equal('x')
  })

})
