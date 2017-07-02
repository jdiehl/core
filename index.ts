export { CoreApp } from './src/core-app'

export {
  CoreService,
  ICoreConfig,
  ICoreContext,
  ICoreServices
} from './src/core-interface'

export {
  AuthService,
  CacheService,
  DbService,
  EmailService,
  SlackService,
  StatsService,
  TokenService
} from './src/services'

export {
  IDbCollection,
  IDbObjectID,
  IDbDeleteResult,
  IDbInsertResult,
  IDbInsertOneResult,
  IDbUpdateResult,
  IDbIndexOptions,
  IDbUpdateOptions
} from './src/services/db-service/db-client'

export {
  EmailSendService,
  IEmailAttachment,
  IEmailSendOptions,
  IEmailSendResult
} from './src/services/email-service/email-service'
