export * from './auth/auth-service'
export * from './auth/auth-interface'
export * from './cache/cache-service'
export * from './cache/cache-interface'
export * from './db/db-service'
export * from './db/db-interface'
export * from './email/email-service'
export * from './email/email-interface'
export * from './model/model-service'
export * from './router/router-service'
export * from './router/router-interface'
export * from './server/server-service'
export * from './slack/slack-service'
export * from './slack/slack-interface'
export * from './stats/stats-service'
export * from './stats/stats-interface'
export * from './template/template-service'
export * from './template/template-interface'
export * from './token/token-service'
export * from './token/token-interface'
export * from './user/user-service'
export * from './user/user-interface'
export * from './validation/validation-service'
export * from './validation/validation-interface'

export const coreServices = {
  auth: exports.AuthService,
  cache: exports.CacheService,
  db: exports.DbService,
  email: exports.EmailService,
  model: exports.ModelService,
  router: exports.RouterService,
  server: exports.ServerService,
  slack: exports.SlackService,
  stats: exports.StatsService,
  template: exports.TemplateService,
  token: exports.TokenService,
  user: exports.UserService,
  validation: exports.ValidationService
}
