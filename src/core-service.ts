import * as Koa from 'koa'
import * as Router from 'koa-router'

import { ICoreConfig, ICoreServices } from './core-interface'

export abstract class CoreService<C extends ICoreConfig = ICoreConfig, S extends ICoreServices = ICoreServices> {
  router?: Router
  constructor(public config: C, public services: S) {}
  async beforeInit?(): Promise<void>
  async init?(): Promise<void>
  install?(server: Koa): void
  async destroy?(): Promise<void>
}
