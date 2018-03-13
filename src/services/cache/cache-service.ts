import * as Koa from 'koa'
import * as url from 'url'

import { ICoreContext } from '../../core-interface'
import { CoreService } from '../../core-service'
import { CacheClientMem } from './cache-client-mem'
import { CacheClientRedis } from './cache-client-redis'
import { ICacheClient, ICacheStore } from './cache-interface'

export class CacheService extends CoreService {
  private client!: ICacheClient

  get sessionStore(): ICacheStore {
    return {
      destroy: (sid: string) => this.client.del(`session:${sid}`),
      get: (sid: string) => this.client.get(`session:${sid}`),
      set: async (sid: string, sess: any, ttl: number) => {
        await this.client.set(`session:${sid}`, sess)
        await this.client.expire(`session:${sid}`, ttl)
      }
    }
  }

  async get(key: string): Promise<any> {
    return await this.client.get(key)
  }

  async set(key: string, value: any): Promise<void> {
    await this.client.set(key, value)
  }

  async del(key: string): Promise<any> {
    return await this.client.del(key)
  }

  async flush(): Promise<void> {
    this.client.flush()
  }

  async hget(key: string, hkey?: string): Promise<any> {
    return await this.client.hget(key, hkey)
  }

  async hset(key: string, value: any): Promise<void>
  async hset(key: string, hkey: string, value: any): Promise<void>
  async hset(key: string, hkeyOrValue: any, value?: any): Promise<void> {
    await this.client.hset(key, hkeyOrValue, value)
  }

  async hdel(key: string, hkey?: string): Promise<void> {
    await this.client.hdel(key, hkey)
  }

  async expire(key: string, ttl: number): Promise<void> {
    await this.client.expire(key, ttl)
  }

  // CoreService

  async beforeInit(): Promise<void> {
    const { cache } = this.config
    const server = cache && cache.server ? cache.server : 'mem://'
    const cacheUrl = url.parse(server)
    this.client = this.createClient(cacheUrl)
    await this.client.init(server)
  }

  async destroy(): Promise<void> {
    if (this.client) await this.client.destroy()
  }

  // protected

  protected createClient(cacheUrl: url.Url): ICacheClient {
    switch (cacheUrl.protocol) {
    case 'mem:': return new CacheClientMem()
    case 'redis:': return new CacheClientRedis()
    default: throw new Error('Invalid cache server type')
    }
  }

}
