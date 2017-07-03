import { clone } from '@-)/utils'
import { Url } from 'url'

import { ICacheClient } from './cache-interface'

export class CacheClientMem implements ICacheClient {
  private store: Record<string, any>

  async init(serverUrl: Url): Promise<void> {
    this.store = {}
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

  async set(key: string, value?: any): Promise<void> {
    this.store[key] = clone(value)
  }

}
