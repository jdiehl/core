jest.mock('nodemailer')

import { EmailService, IEmailConfig } from '../src'
import { mock } from './util'

const config: IEmailConfig = { from: 'me', host: 'host', port: 1234, pool: {} }
const { app, services } = mock({ email: config }, 'email')
const email = services.email as any as EmailService
let nodemailer: any

beforeAll(async () => {
  nodemailer = require('nodemailer')
  await app.init()
})

afterAll(async () => {
  await app.destroy()
})

afterEach(() => {
  nodemailer.__reset()
})

test('should call createTransport', async () => {
  const options = { host: 'host', port: 1234, pool: { pool: true } }
  expect(nodemailer.createTransport).toHaveBeenCalledTimes(1)
  expect(nodemailer.createTransport).toHaveBeenCalledWith(options, { from: 'me' })
})

test('send() should call sendMail', async () => {
  const options = { to: 'you', subject: 'hello', text: 'world' }
  const res = await email.send(options)
  expect(res).toBe('send-ok')
  expect(nodemailer.__transport.sendMail).toHaveBeenCalledTimes(1)
  expect(nodemailer.__transport.sendMail).toHaveBeenCalledWith(options)
})
