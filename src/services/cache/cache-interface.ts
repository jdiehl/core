import { Url } from 'url'

export interface ICacheConfig {
  server: string
}

export interface ICacheClient {
  init(config: string): Promise<void>
  destroy(): Promise<void>
  flush(): Promise<void>
  get(key: string): Promise<any>
  set(key: string, value: any): Promise<void>
  del(key: string): Promise<void>
  hget(key: string, hkey?: string): Promise<any>
  hset(key: string, value: any): Promise<void>
  hset(key: string, hkey: string, value: any): Promise<void>
  hdel(key: string, hkey?: string): Promise<void>
  expire(key: string, ttl: number): Promise<void>
}

export interface ICacheStore {
  destroy(sid: string): Promise<void>
  get(sid: string): Promise<any>
  set(sid: string, sess: any, ttl: number): Promise<void>
}
