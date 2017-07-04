import { parseJSON, promise } from '@-)/utils'
import { createClient, RedisClient } from 'redis'
import { Url } from 'url'

import { ICacheClient } from './cache-interface'

export class CacheClientRedis implements ICacheClient {
  private client: RedisClient

  async init(serverUrl: Url): Promise<void> {
    const { hostname, port } = serverUrl
    const portNumber = port ? parseInt(port, 10) : 6379
    this.client = createClient(portNumber, hostname || '127.0.0.1')
  }

  async destroy(): Promise<void> {
    await promise(cb => this.client.quit(cb))
  }

  async flush(): Promise<void> {
    await promise(cb => this.client.flushall(cb))
  }

  async get(key: string): Promise<any> {
    const value = await promise(cb => this.client.get(key, cb))
    const parsedValue = parseJSON(value)
    return parsedValue === null ? undefined : parsedValue
  }

  async set(key: string, value?: any): Promise<void> {
    if (value === null || value === undefined) {
      await promise(cb => this.client.del(key, cb))
    } else {
      value = JSON.stringify(value)
      await promise(cb => this.client.set(key, value, cb))
    }
  }

}
