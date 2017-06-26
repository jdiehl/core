import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as cacheControl from 'koa-cache-control'
import * as logger from 'koa-logger'
import * as Router from 'koa-router'

import { each, eachAsync } from '@-)/utils'
import { CoreService, ICoreConfig, ICoreServices } from './core-interface'

import { CacheService, MongoService, SlackService, TokenService } from './services'
const coreServices = {
  cache: CacheService,
  mongo: MongoService,
  slack: SlackService,
  token: TokenService
}

export abstract class CoreApp<C extends ICoreConfig, S extends ICoreServices> {
  private server: Koa
  private services: S

  abstract get customServices(): any

  // constructor
  constructor(private config: C) {
    const services: any = {}
    this.addServices(services, coreServices)
    this.addServices(services, this.customServices)
    this.services = services
  }

  // initialize everything
  async init(): Promise<void> {
    await this.initServer()
    await this.initServices()
    await this.startServer()
  }

  private addServices(services: any, add: any) {
    each<any>(add, (TheService, name) => {
      services[name] = new TheService(this.config, services)
    })
  }

  // initialize the server
  private async initServer(): Promise<void> {
    this.server = new Koa()
    this.server.use(logger())
    this.server.use(cacheControl({ noCache: true }))
    this.server.use(bodyParser())
  }

  // initialize and install all services
  private async initServices(): Promise<void> {

    // beforeInit
    await eachAsync<CoreService>(this.services, service => service.beforeInit())

    // init
    await eachAsync<CoreService>(this.services, service => service.init())

    // install
    const router = new Router({ prefix: this.config.prefix })
    await eachAsync<CoreService>(this.services, service => {
      const modRouter = service.install(this.server)
      if (!modRouter) return
      router.use(modRouter.routes(), modRouter.allowedMethods())
    })
    this.server.use(router.routes())
    this.server.use(router.allowedMethods())
  }

  // start the server
  private async startServer(): Promise<void> {
    return new Promise<void>(resolve => this.server.listen(this.config.port, () => resolve()))
  }

}
