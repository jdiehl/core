jest.unmock('nodemailer')

import { EmailSendService, EmailService, IEmailConfig } from '../src'
import { mock } from './util'

const LiveTest = {
  from: 'from@example.com',
  pass: 'xxx',
  service: 'Zoho' as EmailSendService,
  to: 'to@example.com'
}

describe.skip('email:live', () => {
  const config: IEmailConfig = {
    auth: { user: LiveTest.from, pass: LiveTest.pass },
    from: LiveTest.from,
    service: LiveTest.service
  }
  const { app, services } = mock({ email: config } as any, 'email')
  const email = services.email as any as EmailService

  beforeAll(async () => {
    await app.init()
  })

  afterAll(async () => {
    await app.destroy()
  })

  test('should send an email', async () => {
    const res = await email.send({ to: LiveTest.to, subject: 'Test Email', text: 'No text' })
    expect(res.accepted).toEqual([LiveTest.to])
    expect(res.rejected).toEqual([])
  })

})
