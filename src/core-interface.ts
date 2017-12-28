import * as Koa from 'koa'

import * as services from './services'
import './types'

// TODO: Simplify
export interface ICoreConfig {
  auth?: services.IAuthConfig
  cache?: services.ICacheConfig
  db?: services.IDbConfig
  email?: services.IEmailConfig,
  keys?: string[]
  port?: number
  prefix?: string
  quiet?: boolean
  token?: services.ITokenConfig
  router?: services.IRouterConfig,
  session?: {
    key?: string
    maxAge?: number
  }
  slack?: services.ISlackConfig
  stats?: services.IStatsConfig,
  template?: services.ITemplateConfig,
  user?: services.IUserConfig,
  validation?: services.IValidationConfig
}

export interface ICoreContext extends Koa.Context {
}

export interface ICoreServices {
  auth: services.AuthService
  cache: services.CacheService
  db: services.DbService
  email: services.EmailService
  model: services.ModelService
  router: services.RouterService
  server: services.ServerService
  slack: services.SlackService
  stats: services.StatsService
  template: services.TemplateService
  token: services.TokenService
  user: services.UserService
  validation: services.ValidationService
}
