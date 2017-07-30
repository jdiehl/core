'use strict'

const { mockResolve } = require('../util')

const mz = jest.genMockFromModule('mz')

mz.__reset = () => {
  mz.crypto.randomBytes.mockImplementation(mockResolve('random')).mockClear()
  mz.crypto.pbkdf2.mockImplementation(mockResolve('hash')).mockClear()
}
mz.__reset()

module.exports = mz
