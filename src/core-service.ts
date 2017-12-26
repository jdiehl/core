import * as Koa from 'koa'
import * as Router from 'koa-router'

import { ICoreConfig, ICoreContext, ICoreServices } from './core-interface'

export abstract class CoreService {
  router?: Router
  constructor(public config: ICoreConfig, public services: ICoreServices) {}
  async beforeInit?(): Promise<void>
  async init?(): Promise<void>
  async startup?(): Promise<void>
  async destroy?(): Promise<void>

  async before?(context: ICoreContext, key: string, params: any): Promise<void>
  async after?(context: ICoreContext, key: string, res: any): Promise<any>
}
