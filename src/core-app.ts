import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as cacheControl from 'koa-cache-control'
import * as logger from 'koa-logger'
import * as Router from 'koa-router'
import * as session from 'koa-session-minimal'
import { Server } from 'net'

import { each, eachAsync, extend } from '@-)/utils'
import { ICoreConfig, ICoreServices } from './core-interface'
import { CoreService } from './core-service'

import {
  AuthService,
  CacheService,
  DbService,
  EmailService,
  SlackService,
  TemplateService,
  TokenService
} from './services'

const coreServices = {
  auth: AuthService,
  cache: CacheService,
  db: DbService,
  email: EmailService,
  slack: SlackService,
  template: TemplateService,
  token: TokenService
}

export async function errorReporter(context: Koa.Context, next: Function) {
  try {
    await next()
  } catch (err) {
    context.message = err.message
    if (err.status) {
      context.status = err.status
    } else {
      context.status = 500
      context.app.emit('error', err, context)
    }
  }
}

export abstract class CoreApp<C extends ICoreConfig = ICoreConfig, S extends ICoreServices = ICoreServices> {
  instance: Server
  server: Koa
  services: S

  abstract get customServices(): any

  get port(): number {
    return this.instance.address().port
  }

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
  }

  // start the server
  async listen(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.instance = this.server.listen(this.config.port, resolve)
      this.instance.on('error', (err: Error) => reject(err))
    })
  }

  // stop the server
  async close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.instance.close((err: Error) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  private addServices(services: any, add: any) {
    each<any>(add, (TheService, name) => {
      services[name] = new TheService(this.config, services)
    })
  }

  // initialize the server
  private async initServer(): Promise<void> {
    this.server = new Koa()
    if (this.config.keys) this.server.keys = this.config.keys
    this.server.use(logger())
    this.server.use(errorReporter)
    this.server.use(cacheControl({ noCache: true }))
    this.server.use(bodyParser())
    this.server.use(session())
  }

  private sessionConfig(): any {
    return extend({ key: 's', maxAge: 2592000000 }, this.config.session)
  }

  // initialize and install all services
  private async initServices(): Promise<void> {

    // beforeInit
    await eachAsync<CoreService>(this.services, service => {
      if (service.beforeInit) service.beforeInit()
    })

    // init
    await eachAsync<CoreService>(this.services, service => {
      if (service.init) service.init()
    })

    // install
    const router = new Router({ prefix: this.config.prefix })
    each<CoreService>(this.services, service => {
      if (service.install) service.install(this.server)
      if (service.router) router.use(service.router.routes(), service.router.allowedMethods())
    })
    this.server.use(router.routes())
    this.server.use(router.allowedMethods())
  }

}
