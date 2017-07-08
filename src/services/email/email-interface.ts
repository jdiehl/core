// tslint:disable-next-line:max-line-length
export type EmailSendService = '1und1' | 'AOL' | 'DebugMail.io' | 'DynectEmail' | 'FastMail' | 'GandiMail' | 'Gmail' | 'Godaddy' | 'GodaddyAsia' | 'GodaddyEurope' | 'hot.ee' | 'Hotmail' | 'iCloud' | 'mail.ee' | 'Mail.ru' | 'Mailgun' | 'Mailjet' | 'Mandrill' | 'Naver' | 'Postmark' | 'QQ' | 'QQex' | 'SendCloud' | 'SendGrid' | 'SES' | 'Sparkpost' | 'Yahoo' | 'Yandex' | 'Zoho'

export interface IEmailAttachment {
  content: string | Buffer | NodeJS.ReadableStream
  filename: string
  path: string
}

export interface IEmailSendOptions {
  from?: string
  to: string | string[],
  subject: string,
  text?: string | Buffer | NodeJS.ReadableStream,
  html?: string | Buffer | NodeJS.ReadableStream,
  attachments?: IEmailAttachment[]
}

export interface IEmailSendResult {
  accepted: string[]
  rejected: string[]
  response: string
  envelope: { from: string, to: string[] }
  messageId: string
}
