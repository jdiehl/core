import { expect } from 'chai'
import * as request from 'request-promise-native'
import { SinonStub, stub } from 'sinon'

import { SlackService } from '../'
import { mock } from './util'

describe('slack', () => {
  const { services, resetHistory } = mock()
  let slack: SlackService
  const requestPost = request.post
  const json: SinonStub = stub().resolves()
  const post: SinonStub = stub().returns({ json })

  before(() => {
    (request as any).post = post
  })

  beforeEach(async () => {
    resetHistory()
    post.resetHistory()
    slack = new SlackService({ slack: 'my/key' } as any, services as any)
  })

  after(() => {
    (request as any).post = requestPost
  })

  it('should call the slack backend to post a notification', async () => {
    const attachments = [{ a: 1 }]
    const text = 'something'
    await slack.post(text, attachments)
    expect(post.callCount).to.equal(1)
    expect(post.args[0]).to.deep.equal(['https://hooks.slack.com/services/my/key'])
    expect(json.callCount).to.equal(1)
    expect(json.args[0]).to.deep.equal([{ attachments, text }])
  })

})
