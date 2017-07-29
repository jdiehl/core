'use strict'

const { mockYield } = require('../util')

const redis = jest.genMockFromModule('redis')

redis.__client = {
  del: jest.fn(),
  expire: jest.fn(),
  flushall: jest.fn(),
  get: jest.fn(),
  hdel: jest.fn(),
  hget: jest.fn(),
  hset: jest.fn(),
  quit: jest.fn(),
  set: jest.fn()
}

redis.__reset = () => {
  redis.__client.del.mockImplementation(mockYield()).mockClear()
  redis.__client.expire.mockImplementation(mockYield()).mockClear()
  redis.__client.flushall.mockImplementation(mockYield()).mockClear()
  redis.__client.get.mockImplementation(mockYield(null, 'ok')).mockClear()
  redis.__client.hdel.mockImplementation(mockYield()).mockClear()
  redis.__client.hget.mockImplementation(mockYield(null, 'ok')).mockClear()
  redis.__client.hset.mockImplementation(mockYield()).mockClear()
  redis.__client.quit.mockImplementation(mockYield()).mockClear()
  redis.__client.set.mockImplementation(mockYield()).mockClear()
  redis.createClient.mockReturnValue(redis.__client).mockClear()
}
redis.__reset()

module.exports = redis
