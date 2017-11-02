import { ValidationService } from '../src'
import { mock } from './util'

const { app, services } = mock({}, 'validation')
const validation = services.validation as any as ValidationService

beforeAll(async () => {
  await app.init()
})

afterAll(async () => {
  await app.destroy()
})

test('should validate a number', async () => {
  expect(validation.validate({ a: 'number' }, { a: 1 })).toBe(true)
  expect(validation.validate({ a: 'number' }, { a: '1' })).toBe(false)
  expect(validation.validate({ a: 'number' }, { a: {} })).toBe(false)
})

test('should validate a string', async () => {
  expect(validation.validate({ b: 'string' }, { b: 2 })).toBe(false)
  expect(validation.validate({ b: 'string' }, { b: '2' })).toBe(true)
  expect(validation.validate({ b: 'string' }, { b: {} })).toBe(false)
})

test('should validate an email', async () => {
  expect(validation.validate({ b: 'email' }, { b: 2 })).toBe(false)
  expect(validation.validate({ b: 'email' }, { b: '2' })).toBe(false)
  expect(validation.validate({ b: 'email' }, { b: {} })).toBe(false)
  expect(validation.validate({ b: 'email' }, { b: 'test@example.com' })).toBe(true)
  expect(validation.validate({ b: 'email' }, { b: 'something-much.harder_11@lala-nana.foo.bar.space' })).toBe(true)
  expect(validation.validate({ b: 'email' }, { b: 'a@invalid' })).toBe(false)
})

test('should not validate incomplete objects', async () => {
  expect(validation.validate({ a: 'number' }, {})).toBe(false)
  expect(validation.validate({ a: 'string' }, {})).toBe(false)
  expect(validation.validate({ a: 'email' }, {})).toBe(false)
  expect(validation.validate({ a: 'any' }, {})).toBe(false)
  expect(validation.validate({ a: 'any', b: 'any' }, { a: 1 })).toBe(false)
  expect(validation.validate({ a: 'any', b: 'any' }, { b: '2' })).toBe(false)
})

test('should validate incomplete objects if partials are allowed', async () => {
  expect(validation.validate({ a: 'number' }, {}, true)).toBe(true)
  expect(validation.validate({ a: 'string' }, {}, true)).toBe(true)
  expect(validation.validate({ a: 'email' }, {}, true)).toBe(true)
  expect(validation.validate({ a: 'any' }, {}, true)).toBe(true)
  expect(validation.validate({ a: 'any', b: 'any' }, { a: 1 }, true)).toBe(true)
  expect(validation.validate({ a: 'any', b: 'any' }, { b: '2' }, true)).toBe(true)
})

test('should not validate extranuous keys', async () => {
  expect(validation.validate({}, { a: 1})).toBe(false)
  expect(validation.validate({ a: 'string' }, { a: '1', b: 2 })).toBe(false)
  expect(validation.validate({ a: 'email', b: 'number' }, { a: 'a@b.c', b: 2, c: {} })).toBe(false)
  expect(validation.validate({ b: 'any' }, { a: 1, b: {} })).toBe(false)
})

test('should validate a custom validator', async () => {
  const validator = jest.fn().mockReturnValue(true)
  expect(validation.validate({ foo: validator }, { foo: 'bar' })).toBe(true)
  expect(validator).toHaveBeenCalledTimes(1)
  expect(validator).toHaveBeenCalledWith('bar')
})

test('should not validate a failing validator', async () => {
  const validator = jest.fn().mockReturnValue(false)
  expect(validation.validate({ a: validator }, { a: '1' })).toBe(false)
})
