// tslint:disable:no-empty
// tslint:disable:max-classes-per-file
import * as Koa from 'koa'
import * as Router from 'koa-router'
import { ConnectionOptions } from 'tls'

import { AuthService, CacheService, DbService, EmailService, SlackService, TokenService } from './services'
import { IAuthUser } from './services/auth-service/auth-service'
import { EmailSendService } from './services/email-service/email-service'

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
  email?: {
    service?: EmailSendService
    port?: number
    host?: string
    secure?: boolean
    auth?: {
      user: string
      pass: string
    }
    authMethod?: string
    tls?: ConnectionOptions
    pool?: {
      maxConnections?: boolean
      maxMessages?: boolean
      rateDelta?: boolean
      rateLimit?: boolean
    } | false
    proxy?: string
    from?: string
  },
  keys: string[]
  port: number
  prefix?: string
  tokens?: { [domain: string]: string }
  session?: {
    key?: string
    maxAge?: number
  }
  slack?: string
}

export interface ICoreContext extends Koa.Context {
  user: IAuthUser<any>
}

export interface ICoreServices {
  auth: AuthService
  cache: CacheService
  db: DbService
  email: EmailService
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
