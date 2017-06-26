// tslint:disable:no-empty
// tslint:disable:max-classes-per-file
import * as Koa from 'koa'
import * as Router from 'koa-router'

import { CacheService, MongoService, SlackService, TokenService } from './services'

export interface ICoreConfig {
  database?: string
  port: number
  prefix?: string
  tokens?: { [domain: string]: string }
  slackWebhook?: string
}

export interface ICoreContext extends Koa.Context {
}

export interface ICoreServices {
  cache: CacheService
  mongo: MongoService
  slack: SlackService
  token: TokenService
}

export class CoreService<C extends ICoreConfig = ICoreConfig, S extends ICoreServices = ICoreServices> {
  constructor(protected config: C, protected services: S) {}
  async beforeInit() {}
  async init() {}
  install(server: Koa): Router | void {}
}
