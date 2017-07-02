import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'

import { TokenService } from '../'
import { mockServices, resetMockServices } from './util'

describe('token', () => {
  let token: TokenService
  const next: SinonStub = stub()
  const reject: SinonStub = stub()

  function context(t: string): any {
    return {
      request: { header: { 'authentication-token': t } },
      throw: reject
    }
  }

  beforeEach(async () => {
    resetMockServices()
    next.resetHistory()
    reject.resetHistory()
    token = new TokenService({ tokens: { user: 'xxx', admin: 'yyy' } } as any, mockServices as any)
  })

  it('should allow the correct user token', () => {
    token.require('user')(context('xxx'), next)
    expect(next.callCount).to.equal(1)
    expect(reject.callCount).to.equal(0)
  })

  it('should allow the correct admin token', () => {
    token.require('admin')(context('yyy'), next)
    expect(next.callCount).to.equal(1)
    expect(reject.callCount).to.equal(0)
  })

  it('should reject an invalid token', () => {
    token.require('user')(context('yyy'), next)
    expect(next.callCount).to.equal(0)
    expect(reject.callCount).to.equal(1)
  })

  it('should allow the user token if both are allowed', () => {
    token.require(['user', 'admin'])(context('xxx'), next)
    expect(next.callCount).to.equal(1)
    expect(reject.callCount).to.equal(0)
  })

  it('should allow the admin token if both are allowed', () => {
    token.require(['user', 'admin'])(context('yyy'), next)
    expect(next.callCount).to.equal(1)
    expect(reject.callCount).to.equal(0)
  })

})
