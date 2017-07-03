import { expect } from 'chai'
import * as crypto from 'crypto'
import { stub } from 'sinon'

import { AuthService, IUser } from '../'
import { mockCursor, mockServices, resetMockServices } from './util'

describe('auth', () => {
  let auth: AuthService

  before(() => {
    const u1 = {
      _id: 'id1',
      email: 'uc1@b.c',
      hash: 'hash1',
      profile: { name: 'Peter' },
      salt: 'salt1'
    }
    const u2 = {
      _id: 'id2',
      email: 'u2@b.c',
      hash: 'hash2',
      profile: { name: 'Susan' },
      salt: 'salt2'
    }
    mockCursor.toArray.resolves([u1, u2])
    mockCursor.findOne.resolves(u1)
  })

  after(() => {
    mockCursor.toArray.resolves()
    mockCursor.findOne.resolves()
  })

  beforeEach(async () => {
    resetMockServices()
    auth = new AuthService({ auth: { secret: 'mysecret', prefix: '/auth' } } as any, mockServices as any)
    await auth.init()
  })

  it('find() should find and sanitize users', async () => {
    const users = await auth.find()
    expect(users).to.deep.equal([
      { _id: 'id1', email: 'uc1@b.c', profile: { name: 'Peter' } },
      { _id: 'id2', email: 'uc2@b.c', profile: { name: 'Susan' } }
    ])
  })

  // describe('mock', () => {
  //   const cryptoPbkdf2 = crypto.pbkdf2
  //   const pbkdf2 = stub().resolves('ok')

  //   before(() => {
  //     (crypto as any).pbkdf2 = pbkdf2
  //   })

  //   after(() => {
  //     (crypto as any).pbkdf2 = cryptoPbkdf2
  //   })

  //   it('find() should find and sanitize users', async () => {
  //     const users = await auth.find()

  //   })

  // })

})
