import { clone } from '@didie/utils'
import { Url } from 'url'

import { ICacheClient } from './cache-interface'

export class CacheClientMem implements ICacheClient {
  private store: Record<string, any> = {}
  private expires: Record<string, any> = {}

  async init(config: string): Promise<void> {
  }

  async destroy(): Promise<void> {
    // nothing
  }

  async flush(): Promise<void> {
    this.store = {}
  }

  async get(key: string): Promise<any> {
    return this.store[key]
  }

  async set(key: string, value: any): Promise<void> {
    this.clearExpire(key)
    this.store[key] = clone(value)
  }

  async del(key: string): Promise<void> {
    this.clearExpire(key)
    delete this.store[key]
  }

  async hget(key: string, hkey?: string): Promise<any> {
    let val = this.store[key]
    if (hkey && val) val = val[hkey]
    return val
  }

  async hset(key: string, hkeyOrValue: any, value?: any): Promise<void> {
    if (value === undefined) {
      this.store[key] = hkeyOrValue
    } else {
      if (!this.store[key]) this.store[key] = {}
      this.store[key][hkeyOrValue] = value
    }
  }

  async hdel(key: string, hkey?: string): Promise<void> {
    if (hkey) {
      if (this.store[key]) delete this.store[key][hkey]
    } else {
      delete this.store[key]
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    this.clearExpire(key)
    this.expires[key] = setTimeout(() => delete this.store[key], ttl * 1000)
  }

  private clearExpire(key: string) {
    if (this.expires[key]) {
      clearTimeout(this.expires[key])
      delete this.expires[key]
    }
  }

}
