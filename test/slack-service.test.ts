jest.mock('request-promise-native')

import { ISlackConfig, SlackService } from '../'
import { mock } from './util'

const config: ISlackConfig = { hook: 'my/key' }
const { app, services } = mock({ slack: config }, 'slack')
const slack = services.slack as any as SlackService
let request: any

beforeAll(async () => {
  request = require('request-promise-native')
  await app.init()
})

afterAll(async () => {
  await app.destroy()
})

afterEach(() => {
  request.__reset()
})

test('should call the slack backend to post a notification', async () => {
  await slack.post('something', [{ a: 1 }])
  expect(request.post).toHaveBeenCalledTimes(1)
  expect(request.post).toHaveBeenCalledWith('https://hooks.slack.com/services/my/key')
  expect(request.__cursor.json).toHaveBeenCalledTimes(1)
  expect(request.__cursor.json).toHaveBeenCalledWith({ attachments: [{ a: 1 }], text: 'something' })
})
