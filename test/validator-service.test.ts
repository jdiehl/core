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
  expect(validation.validate({ a: 'number' }, { a: 1 }, 'insert')).toBe(true)
  expect(validation.validate({ a: 'number' }, { a: '1' }, 'insert')).toBe(false)
  expect(validation.validate({ a: 'number' }, { a: {} }, 'insert')).toBe(false)
  expect(validation.validate({ b: 'string' }, { b: new Date() }, 'insert')).toBe(false)
})

test('should validate a string', async () => {
  expect(validation.validate({ b: 'string' }, { b: 2 }, 'insert')).toBe(false)
  expect(validation.validate({ b: 'string' }, { b: '2' }, 'insert')).toBe(true)
  expect(validation.validate({ b: 'string' }, { b: {} }, 'insert')).toBe(false)
  expect(validation.validate({ b: 'string' }, { b: new Date() }, 'insert')).toBe(false)
})

test('should validate a date', async () => {
  expect(validation.validate({ b: 'date' }, { b: 2 }, 'insert')).toBe(false)
  expect(validation.validate({ b: 'date' }, { b: '2' }, 'insert')).toBe(false)
  expect(validation.validate({ b: 'date' }, { b: {} }, 'insert')).toBe(false)
  expect(validation.validate({ b: 'date' }, { b: new Date() }, 'insert')).toBe(true)
})

test('should validate an email', async () => {
  expect(validation.validate({ b: 'email' }, { b: 2 }, 'insert')).toBe(false)
  expect(validation.validate({ b: 'email' }, { b: '2' }, 'insert')).toBe(false)
  expect(validation.validate({ b: 'email' }, { b: {} }, 'insert')).toBe(false)
  expect(validation.validate({ b: 'email' }, { b: 'test@example.com' }, 'insert')).toBe(true)
  const email = 'something-much.harder_11@lala-nana.foo.bar.space'
  expect(validation.validate({ b: 'email' }, { b: email }, 'insert')).toBe(true)
  expect(validation.validate({ b: 'email' }, { b: 'a@invalid' }, 'insert')).toBe(false)
})

test('should not validate incomplete objects', async () => {
  expect(validation.validate({ a: 'number' }, {}, 'insert')).toBe(false)
  expect(validation.validate({ a: 'string' }, {}, 'insert')).toBe(false)
  expect(validation.validate({ a: 'email' }, {}, 'insert')).toBe(false)
  expect(validation.validate({ a: 'any' }, {}, 'insert')).toBe(false)
  expect(validation.validate({ a: 'any', b: 'any' }, { a: 1 }, 'insert')).toBe(false)
  expect(validation.validate({ a: 'any', b: 'any' }, { b: '2' }, 'insert')).toBe(false)
})

test('should validate incomplete objects if partials are allowed', async () => {
  expect(validation.validate({ a: 'number' }, {}, 'update')).toBe(true)
  expect(validation.validate({ a: 'string' }, {}, 'update')).toBe(true)
  expect(validation.validate({ a: 'email' }, {}, 'update')).toBe(true)
  expect(validation.validate({ a: 'any' }, {}, 'update')).toBe(true)
  expect(validation.validate({ a: 'any', b: 'any' }, { a: 1 }, 'update')).toBe(true)
  expect(validation.validate({ a: 'any', b: 'any' }, { b: '2' }, 'update')).toBe(true)
})

test('should not validate extranuous keys', async () => {
  expect(validation.validate({}, { a: 1}, 'insert')).toBe(false)
  expect(validation.validate({ a: 'string' }, { a: '1', b: 2 }, 'insert')).toBe(false)
  expect(validation.validate({ a: 'email', b: 'number' }, { a: 'a@b.c', b: 2, c: {} }, 'insert')).toBe(false)
  expect(validation.validate({ b: 'any' }, { a: 1, b: {} }, 'insert')).toBe(false)
})

test('should validate a custom validator', async () => {
  const validator = jest.fn().mockReturnValue(true)
  expect(validation.validate({ foo: validator }, { foo: 'bar' }, 'insert')).toBe(true)
  expect(validator).toHaveBeenCalledTimes(1)
  expect(validator).toHaveBeenCalledWith('bar')
})

test('should not validate a failing validator', async () => {
  const validator = jest.fn().mockReturnValue(false)
  expect(validation.validate({ a: validator }, { a: '1' }, 'insert')).toBe(false)
})
