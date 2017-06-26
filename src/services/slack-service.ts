import * as path from 'path'
import * as request from 'request-promise-native'

import { CoreService } from '../core-interface'

export class SlackService extends CoreService {

  async post(text: string, attachments: any[]): Promise<void> {
    if (!this.config.slackWebhook) throw new Error('Missing slack configuration')
    const data = { attachments, text }
    const url = 'https://hooks.slack.com/services/' + this.config.slackWebhook
    await request.post(url).json(data)
  }

}
