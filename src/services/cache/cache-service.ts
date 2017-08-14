import * as Koa from 'koa'
import * as url from 'url'

import { ICoreContext } from '../../core-interface'
import { CoreService } from '../../core-service'
import { CacheClientMem } from './cache-client-mem'
import { CacheClientRedis } from './cache-client-redis'
import { ICacheClient, ICacheStore } from './cache-interface'

export class CacheService extends CoreService {
  private client: ICacheClient

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
    const config = this.config.cache || 'mem://'
    const cacheUrl = url.parse(config)
    this.client = this.createClient(cacheUrl)
    await this.client.init(config)
  }

  async destroy(): Promise<void> {
    if (this.client) await this.client.destroy()
  }

  install(server: Koa): void {
    server.use(async (context: ICoreContext, next: () => void) => {
      if (context.request.method !== 'GET') return next()
      const key = `${context.request.path}?${context.request.querystring}`
      const cachedBody = await this.get(key)
      if (cachedBody) {
        context.body = cachedBody
        // TODO: this prevents stats from working
      } else {
        await next()
        this.set(key, context.body)
      }
    })
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
