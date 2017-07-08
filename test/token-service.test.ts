import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'

import { TokenService } from '../'
import { expectRejection, mockServices, resetMockServices } from './util'

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

  before(() => {
    mockServices.cache.get.resolves({ reference: 'ok' })
  })

  after(() => {
    mockServices.cache.get.resolves()
  })

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

  it('create() should create a random token', async () => {
    const reference = { a: 1 }
    const key = await token.create(reference)
    expect(key).to.be.a('string')
    expect(key).to.have.length(128)
    expect(mockServices.cache.set.callCount).to.equal(1)
    expect(mockServices.cache.set.args[0]).to.deep.equal([`token:${key}`, { reference }])
  })

  it('create() should set the useCount', async () => {
    await token.create({}, { useCount: 3 })
    expect(mockServices.cache.set.callCount).to.equal(1)
    expect(mockServices.cache.set.args[0][1]).to.deep.equal({ reference: {}, usesLeft: 3 })
  })

  it('create() should set the expiry date', async () => {
    await token.create({}, { validFor: '1s' })
    expect(mockServices.cache.set.callCount).to.equal(1)
    const { validUntil } = mockServices.cache.set.args[0][1]
    expect(validUntil).to.be.a('number')
    expect(validUntil - new Date().getTime()).to.be.within(0, 1000)
  })

  it('use() should retrieve a token', async () => {
    const ref = await token.use('key')
    expect(ref).to.equal('ok')
    expect(mockServices.cache.get.callCount).to.equal(1)
    expect(mockServices.cache.get.args[0]).to.deep.equal([`token:key`])
  })

  it('use() should update the use counter', async () => {
    mockServices.cache.get.resolves({ reference: 'uses', usesLeft: 3 })
    await token.use('key')
    expect(mockServices.cache.set.callCount).to.equal(1)
    expect(mockServices.cache.set.args[0]).to.deep.equal([`token:key`, { reference: 'uses', usesLeft: 2 }])
  })

  it('use() should reject an expired use counter', async () => {
    mockServices.cache.get.resolves({ reference: 'expired', usesLeft: 0 })
    await expectRejection(() => token.use('key'), 'Invalid Token')
  })

  it('use() should reject an expired date', async () => {
    mockServices.cache.get.resolves({ reference: 'expired', validUntil: new Date().getTime() - 1000 })
    await expectRejection(() => token.use('key'), 'Invalid Token')
  })

})
