import { Url } from 'url'

export interface ICacheClient {
  init(cacheUrl: Url): Promise<void>
  destroy(): Promise<void>
  flush(): Promise<void>
  get(key: string): Promise<any>
  set(key: string, value?: any): Promise<void>
}
