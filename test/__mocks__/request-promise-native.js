'use strict'

const request = jest.genMockFromModule('request-promise-native')

const cur = request.__cursor = {
  json: jest.fn()
}

request.__reset = () => {
  request.post.mockReturnValue(cur).mockClear()
  cur.json.mockReset()
}
request.__reset()

module.exports = request
