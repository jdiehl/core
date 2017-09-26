import { map, parseJSON, promise } from '@didie/utils'
import { createClient, RedisClient } from 'redis'
import { Url } from 'url'

import { ICacheClient } from './cache-interface'

export class CacheClientRedis implements ICacheClient {
  private client: RedisClient

  async init(config: string): Promise<void> {
    this.client = createClient(config)
  }

  async destroy(): Promise<void> {
    await promise(cb => this.client.quit(cb))
  }

  async flush(): Promise<void> {
    await promise(cb => this.client.flushall(cb))
  }

  async get(key: string): Promise<any> {
    const val = await promise(cb => this.client.get(key, cb))
    const res = parseJSON(val)
    return res === null ? undefined : res
  }

  async set(key: string, value?: any): Promise<void> {
    await promise(cb => this.client.set(key, JSON.stringify(value), cb))
  }

  async del(key: string): Promise<void> {
    await promise(cb => this.client.del(key, cb))
  }

  async hget(key: string, hkey?: string): Promise<any> {
    if (hkey === undefined) {
      const values = await promise(cb => this.client.hgetall(key, cb))
      if (values === null) return
      return map(values, parseJSON)
    }
    const val = await promise(cb => this.client.hget(key, hkey, cb))
    const res = parseJSON(val)
    return res === null ? undefined : res
  }

  async hset(key: string, hkeyOrValue: any, value?: any): Promise<void> {
    if (value) {
      await promise(cb => this.client.hset(key, hkeyOrValue, JSON.stringify(value), cb))
    } else {
      value = map(hkeyOrValue, (d: any) => JSON.stringify(d))
      await promise(cb => this.client.hmset(key, hkeyOrValue))
    }
  }

  async hdel(key: string, hkey?: string): Promise<void> {
    if (hkey) {
      await promise(cb => this.client.hdel(key, hkey, cb))
    } else {
      await promise(cb => this.client.del(key, cb))
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    if (ttl % 1 === 0) {
      await promise(cb => this.client.expire(key, ttl, cb))
    } else {
      await promise(cb => this.client.pexpire(key, Math.round(ttl * 1000), cb))
    }
  }

}
