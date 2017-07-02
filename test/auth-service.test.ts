import { expect } from 'chai'
import * as crypto from 'crypto'
import { stub } from 'sinon'

import { AuthService } from '../'
import { mockServices, resetMockServices } from './util'

describe('auth', () => {
  let auth: AuthService

  beforeEach(async () => {
    resetMockServices()
    auth = new AuthService({ auth: { secret: 'mysecret', prefix: '/auth' } } as any, mockServices as any)
    await auth.init()
  })

  describe('mock', () => {
    const cryptoPbkdf2 = crypto.pbkdf2
    const pbkdf2 = stub().resolves('ok')

    before(() => {
      (crypto as any).pbkdf2 = pbkdf2
    })

    after(() => {
      (crypto as any).pbkdf2 = cryptoPbkdf2
    })

    it('login() should coll pbkdf2', () => {
      // todo
    })

  })

  it('...', async () => {
    // todo
  })

})
