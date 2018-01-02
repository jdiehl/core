import { ICoreConfig, ICoreServices } from './core-interface'

export abstract class CoreService {
  constructor(public config: ICoreConfig, public services: ICoreServices) {}
  async beforeInit?(): Promise<void>
  async init?(): Promise<void>
  async startup?(): Promise<void>
  async destroy?(): Promise<void>
}
