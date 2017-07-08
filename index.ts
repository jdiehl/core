export { CoreApp } from './src/core-app'

export { ICoreConfig, ICoreContext, ICoreServices } from './src/core-interface'
export { CoreService } from './src/core-service'
export { CoreModel } from './src/core-model'

export {
  AuthService,
  CacheService,
  DbService,
  EmailService,
  RouterService,
  SlackService,
  StatsService,
  TemplateService,
  TokenService
} from './src/services'

export {
  IUser
} from './src/services/auth/auth-interface'

export {
  IDbCollection,
  IDbObjectID,
  IDbDeleteResult,
  IDbInsertResult,
  IDbInsertOneResult,
  IDbUpdateResult,
  IDbIndexOptions,
  IDbUpdateOptions
} from './src/services/db/db-interface'

export {
  EmailSendService,
  IEmailAttachment,
  IEmailSendOptions,
  IEmailSendResult
} from './src/services/email/email-interface'

export {
  IRouterOptions
} from './src/services/router/router-interface'

export {
  Delete,
  Get,
  Post,
  Put,
  Router
} from './src/services/router/router-decorators'
