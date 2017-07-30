'use strict'

const { mockResolve } = require('../util')

const nm = jest.genMockFromModule('nodemailer')

const trans = nm.__transport = {
  sendMail: jest.fn()
}

nm.createTransport = jest.fn()

nm.__reset = () => {
  trans.sendMail.mockImplementation(mockResolve('send-ok')).mockClear()
  nm.createTransport.mockReturnValue(trans).mockClear()
}
nm.__reset()

module.exports = nm
