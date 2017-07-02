import { createTransport, Transporter } from 'nodemailer'

import { CoreService } from '../../core-interface'

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
  text: string | Buffer | NodeJS.ReadableStream,
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

export class EmailService extends CoreService {
  transporter: Transporter

  async send(options: IEmailSendOptions): Promise<IEmailSendResult> {
    const res = await this.transporter.sendMail(options)
    return res
  }

  // CoreService

  async init(): Promise<void> {
    if (!this.config.email) return
    const { from, ...options } = this.config.email
    if (options.pool) (options as any).pool.pool = true
    this.transporter = createTransport(options as any, { from })
  }

  async destroy(): Promise<void> {
    if (this.transporter && this.transporter.close) this.transporter.close()
  }

}