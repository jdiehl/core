// tslint:disable:no-empty
// tslint:disable:max-classes-per-file
import * as Koa from 'koa'
import * as Router from 'koa-router'
import { ConnectionOptions } from 'tls'

import { IUser } from './services/auth/auth-interface'
import { EmailSendService } from './services/email/email-interface'

import {
  AuthService,
  CacheService,
  DbService,
  EmailService,
  SlackService,
  StatsService,
  TemplateService,
  TokenService
} from './services'

export interface ICoreConfig {
  auth?: {
    collection?: string
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
  router: {
    prefix?: string
    requireToken?: string
  }
  session?: {
    key?: string
    maxAge?: number
  }
  slack?: string
  stats?: {
    collection: string
    includeHeader?: string[]
  },
  template?: {
    templates?: Record<string, string>
  }
}

export interface ICoreContext extends Koa.Context {
  user: IUser<any>
}

export interface ICoreServices {
  auth: AuthService
  cache: CacheService
  db: DbService
  email: EmailService
  slack: SlackService
  stats: StatsService
  template: TemplateService
  token: TokenService
}

export class CoreService<C extends ICoreConfig = ICoreConfig, S extends ICoreServices = ICoreServices> {
  router?: Router
  constructor(public config: C, public services: S) {}
  async beforeInit(): Promise<void> {}
  async init(): Promise<void> {}
  install(server: Koa): void {}
  async destroy(): Promise<void> {}
}
