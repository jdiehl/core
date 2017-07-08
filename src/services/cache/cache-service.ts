import * as Koa from 'koa'
import * as url from 'url'

import { ICoreContext } from '../../core-interface'
import { CoreService } from '../../core-service'
import { CacheClientMem } from './cache-client-mem'
import { CacheClientRedis } from './cache-client-redis'
import { ICacheClient } from './cache-interface'

export class CacheService extends CoreService {
  private client: ICacheClient

  async get(key: string): Promise<any> {
    return await this.client.get(key)
  }

  async set(key: string, value?: any): Promise<void> {
    return await this.client.set(key, value)
  }

  async flush(): Promise<void> {
    await this.client.flush()
  }

  // CoreService

  async beforeInit(): Promise<void> {
    if (!this.config.cache) return
    const cacheUrl = url.parse(this.config.cache)
    if (!cacheUrl) return
    this.client = this.createClient(cacheUrl)
    await this.client.init(cacheUrl)
  }

  async destroy(): Promise<void> {
    await this.client.destroy()
  }

  install(server: Koa): void {
    server.use(async (context: ICoreContext, next: () => void) => {
      const key = `${context.request.path}?${context.request.querystring}`
      const cachedBody = await this.get(key)
      if (cachedBody) {
        context.body = cachedBody
      } else {
        await next()
        this.set(key, context.body)
      }
    })
  }

  // private

  private createClient(cacheUrl: url.Url): ICacheClient {
    switch (cacheUrl.protocol) {
    case 'mem:': return new CacheClientMem()
    case 'redis:': return new CacheClientRedis()
    default: throw new Error('Invalid cache server type')
    }
  }

}
