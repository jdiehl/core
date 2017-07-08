import { createTransport, Transporter } from 'nodemailer'

import { CoreService } from '../../core-service'
import { IEmailSendOptions, IEmailSendResult } from './email-interface'

export class EmailService extends CoreService {
  transporter: Transporter

  async send(options: IEmailSendOptions): Promise<IEmailSendResult> {
    const res = await this.transporter.sendMail(options)
    return res
  }

  async sendTemplate(template: string, vars: Record<string, any>, options: IEmailSendOptions) {
    options.html = await this.services.template.render(template, vars)
    return this.send(options)
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
