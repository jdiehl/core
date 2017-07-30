import { each } from '@-)/utils'

export type MockifiedObjects<T> = { [P in keyof T]: MockifiedObject<T[P]> } & { resetHistory: () => void }
export type MockifiedObject<T> = { [K in keyof T]: jest.Mock<any> }
export type MockFilter = (name: string) => boolean
export type MockInit = (stub: jest.Mock<any>, name: string) => void

const x = jest.fn()

export function mockify<T = object>(obj: T, init?: MockInit, objSource = obj): MockifiedObject<T> {
  const mock: any = {}
  const stubs: Array<jest.Mock<any>> = []

  function mockifyPrototype(prototype: any) {
    if (!prototype.__proto__) return
    Object.getOwnPropertyNames(prototype).forEach(name => {
      if (typeof prototype[name] === 'function') {
        mock[name] = jest.fn()
        if (init) init(mock[name], name)
        stubs.push(mock[name])
      }
    })
    mockifyPrototype(prototype.__proto__)
  }

  mockifyPrototype(obj)

  mock.mockClear = () => stubs.forEach(s => s.mockClear())
  return mock
}

export function mockifyMany<T = Record<string, object>>(
  objects: T,
  filter?: MockFilter,
  init?: MockInit
): MockifiedObjects<T> {
  const anyObjects = objects as any
  each(anyObjects, (object, name) => {
    anyObjects[name] = (filter && !filter(name)) ? object : mockify(object, init)
  })
  return anyObjects
}

export function mockifyClasses<T = Record<string, Function>>(obj: T, init?: MockInit): MockifiedObjects<T> {
  const mock: any = {}
  each(obj as any, (ClassObject, name) => {
    mock[name] = mockify(ClassObject.prototype, init)
  })
  return mock
}

export function mockClear(obj: object): void {
  each(obj as any, o => {
    if (o.mockClear) o.mockClear()
  })
}

export function mockReset(obj: object): void {
  each(obj as any, o => {
    if (o.mockReset) o.mockReset()
  })
}

export function mockYield(...returns: any[]) {
  // tslint:disable-next-line:only-arrow-functions
  return function() {
    const fn = arguments[arguments.length - 1]
    if (typeof fn === 'function') fn(...returns)
  }
}

export function mockResolve(value?: any) {
  return async () => value
}

export function mockReject(value?: any) {
  return async () => { throw value }
}
