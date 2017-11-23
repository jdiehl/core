import { Readable } from 'stream'
import { ConnectionOptions } from 'tls'

// tslint:disable-next-line:max-line-length
export type EmailSendService = '1und1' | 'AOL' | 'DebugMail.io' | 'DynectEmail' | 'FastMail' | 'GandiMail' | 'Gmail' | 'Godaddy' | 'GodaddyAsia' | 'GodaddyEurope' | 'hot.ee' | 'Hotmail' | 'iCloud' | 'mail.ee' | 'Mail.ru' | 'Mailgun' | 'Mailjet' | 'Mandrill' | 'Naver' | 'Postmark' | 'QQ' | 'QQex' | 'SendCloud' | 'SendGrid' | 'SES' | 'Sparkpost' | 'Yahoo' | 'Yandex' | 'Zoho'

export interface IEmailConfig {
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
}

export interface IEmailAttachment {
  content: string | Buffer | Readable
  filename: string
  path: string
}

export interface IEmailSendOptions {
  from?: string
  to: string | string[],
  subject: string,
  text?: string | Buffer | Readable,
  html?: string | Buffer | Readable,
  attachments?: IEmailAttachment[]
}

export interface IEmailSendResult {
  accepted: string[]
  rejected: string[]
  response: string
  envelope: { from: string, to: string[] }
  messageId: string
}
