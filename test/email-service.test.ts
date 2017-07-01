import { expect } from 'chai'
import * as nodemailer from 'nodemailer'
import { stub } from 'sinon'
import { EmailService } from '../'

const LiveTest = {
  from: 'from@example.com',
  pass: 'xxx',
  service: 'Zoho',
  to: 'to@example.com'
}

describe('email', () => {
  let email: EmailService
  const nodemailerCreateTransport = nodemailer.createTransport
  const sendMail = stub().resolves('ok')
  const createTransport = stub().returns({ sendMail })

  describe.skip('live', () => {

    beforeEach(async () => {
      email = new EmailService({ email: {
        auth: { user: LiveTest.from, pass: LiveTest.pass },
        from: LiveTest.from,
        logger: true,
        service: LiveTest.service
      } } as any, [] as any)
      await email.init()
    })

    it('should send an email', async () => {
      const res = await email.send({ to: LiveTest.to, subject: 'Test Email', text: 'No text' })
      expect(res.accepted).to.deep.equal([LiveTest.to])
      expect(res.rejected).to.deep.equal([])
    }).timeout(10000)

  })

  describe('mock', () => {

    before(() => {
      (nodemailer as any).createTransport = createTransport
    })

    beforeEach(async () => {
      sendMail.resetHistory()
      createTransport.resetHistory()
      email = new EmailService({ email: { from: 'me', host: 'host', port: 1234, pool: {} } } as any, [] as any)
      await email.init()
    })

    after(() => {
      (nodemailer as any).createTransport = nodemailerCreateTransport
    })

    it('should call createTransport', async () => {
      expect(createTransport.callCount).to.equal(1)
      expect(createTransport.calledWith({ host: 'host', port: 1234, pool: { pool: true } }, { from: 'me' })).to.be.true
    })

    it('send() should call sendMail', async () => {
      const res = await email.send({ to: 'you', subject: 'hello', text: 'world' })
      expect(res).to.equal('ok')
      expect(sendMail.callCount).to.equal(1)
      expect(sendMail.calledWith({ to: 'you', subject: 'hello', text: 'world' })).to.be.true
    })

  })

})
