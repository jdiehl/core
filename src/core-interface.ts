// tslint:disable:no-empty
// tslint:disable:max-classes-per-file
import * as Koa from 'koa'
import * as Router from 'koa-router'

import { AuthService, CacheService, DbService, SlackService, TokenService } from './services'

export interface ICoreConfig {
  auth?: {
    encoding?: string
    digest?: string
    iterations?: number
    keylen?: number
    saltlen?: number
    secret: string
    prefix: string
  }
  cache?: string
  db?: string
  keys: string[]
  port: number
  prefix?: string
  tokens?: { [domain: string]: string }
  session?: {
    key?: string
    maxAge?: number
  }
  slackWebhook?: string
}

export interface ICoreContext extends Koa.Context {
}

export interface ICoreServices {
  auth: AuthService
  cache: CacheService
  db: DbService
  slack: SlackService
  token: TokenService
}

export class CoreService<C extends ICoreConfig = ICoreConfig, S extends ICoreServices = ICoreServices> {
  constructor(protected config: C, protected services: S) {}
  async beforeInit() {}
  async init() {}
  install(server: Koa): Router | void {}
  async destroy() {}
}
