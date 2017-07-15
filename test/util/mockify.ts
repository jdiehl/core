import { each } from '@-)/utils'
import { SinonStub, stub } from 'sinon'

export type MockifiedObjects<T> = { [P in keyof T]: MockifiedObject<T[P]> } & { resetHistory: () => void }
export type MockifiedObject<T> = { [K in keyof T]: SinonStub }
export type MockInit = (stub: SinonStub, name: string) => void

export function mockify<T = object>(obj: T, init?: MockInit): MockifiedObject<T> {
  const mock: any = {}
  const stubs: SinonStub[] = []
  Object.getOwnPropertyNames(obj).forEach(name => {
    if (typeof (obj as any)[name] === 'function') {
      mock[name] = stub()
      if (init) init(mock[name], name)
      stubs.push(mock[name])
    }
  })
  mock.resetHistory = () => stubs.forEach(s => s.resetHistory())
  return mock
}

export function mockifyClasses<T = Record<string, Function>>(obj: T, init?: MockInit): MockifiedObjects<T> {
  const mock: any = {}
  each(obj as any, (ClassObject, name) => {
    mock[name] = mockify(ClassObject.prototype, s => s.resolves())
  })
  return mock
}

export function mockReset(obj: object): void {
  each(obj as any, o => o.resetHistory())
}
