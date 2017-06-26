import * as Koa from 'koa'
import { CoreService, ICoreContext } from '../core-interface'

export class CacheService extends CoreService {
  store: {[key: string]: any} = {}

  async get(key: string): Promise<any> {
    return this.store[key]
  }

  async set(key: string, value: any): Promise<void> {
    this.store[key] = value
  }

  async flush(): Promise<void> {
    this.store = {}
  }

  serve(): Koa.Middleware {
    return async (context: ICoreContext, next: () => void) => {
      const key = `${context.request.path}?${context.request.querystring}`
      const cachedBody = await this.get(key)
      if (cachedBody) {
        context.body = cachedBody
      } else {
        await next()
        this.set(key, context.body)
      }
    }
  }

}
