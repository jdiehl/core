import * as path from 'path'
import { post } from 'request-promise-native'

import { CoreService } from '../../core-service'

export class SlackService extends CoreService {

  async post(text: string, attachments: any[]): Promise<void> {
    const { slack } = this.config
    if (!slack || !slack.hook) throw new Error('Missing slack configuration')
    const data = { attachments, text }
    const url = 'https://hooks.slack.com/services/' + slack.hook
    await post(url).json(data)
  }

}
