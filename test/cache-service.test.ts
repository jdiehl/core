import { expect } from 'chai'

import { CacheService } from '../'

describe('cache-service', () => {
  let cache: CacheService

  beforeEach(async () => {
    cache = new CacheService({} as any, [] as any)
    await cache.beforeInit()
    await cache.init()
  })

  it('set() should store a simple value', async () => {
    await cache.set('foo', 'bar')
    const x = await cache.get('foo')
    expect(x).to.equal('bar')
  })

  it('set() should store an object', async () => {
    const a = { a: { b: 3 } }
    await cache.set('something', a)
    const x = await cache.get('something')
    expect(x).to.deep.equal(a)
  })

  it('set() should overwrite a previous value', async () => {
    await cache.set('x', 1)
    await cache.set('x', 2)
    const x = await cache.get('x')
    expect(x).to.equal(2)
  })

  it('flush() should remove all objects', async () => {
    await cache.set('z', 1)
    await cache.flush()
    const x = await cache.get('z')
    expect(x).to.be.undefined
  })

})
