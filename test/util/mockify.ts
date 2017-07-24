import { each } from '@-)/utils'
import { SinonStub, stub } from 'sinon'

export type MockifiedObjects<T> = { [P in keyof T]: MockifiedObject<T[P]> } & { resetHistory: () => void }
export type MockifiedObject<T> = { [K in keyof T]: SinonStub }
export type MockFilter = (name: string) => boolean
export type MockInit = (stub: SinonStub, name: string) => void

export function mockify<T = object>(obj: T, init?: MockInit, objSource = obj): MockifiedObject<T> {
  const mock: any = {}
  const stubs: SinonStub[] = []

  function mockifyPrototype(prototype: any) {
    if (!prototype.__proto__) return
    Object.getOwnPropertyNames(prototype).forEach(name => {
      if (typeof prototype[name] === 'function') {
        mock[name] = stub()
        if (init) init(mock[name], name)
        stubs.push(mock[name])
      }
    })
    mockifyPrototype(prototype.__proto__)
  }

  mockifyPrototype(obj)

  mock.resetHistory = () => stubs.forEach(s => s.resetHistory())
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
    console.log(name)
    mock[name] = mockify(ClassObject.prototype, init)
  })
  return mock
}

export function mockReset(obj: object): void {
  each(obj as any, o => {
    if (o.resetHistory) o.resetHistory()
  })
}
