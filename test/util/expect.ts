import { expect } from 'chai'

export async function expectRejection(code: () => Promise<any>, expectedMessage?: string, message?: string) {
  let error: any
  try {
    await code()
  } catch (err) {
    error = err
  }
  if (error === undefined) {
    expect.fail(message)
  } else if (expectedMessage) {
    expect(error.message).to.equal(expectedMessage, message)
  }
}
