import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as cacheControl from 'koa-cache-control'
import * as logger from 'koa-logger'
import * as Router from 'koa-router'
import * as session from 'koa-session-minimal'
import { Server } from 'net'

import { each, eachAsync, extend } from '@didie/utils'
import { ICoreConfig, ICoreServices } from './core-interface'
import { CoreService } from './core-service'

import { coreServices } from './services'

export function errorReporter(config: ICoreConfig): Koa.Middleware {
  return async (context: Koa.Context, next: Function) => {
    try {
      await next()
    } catch (err) {
      context.message = err ? (err.message ? err.message : err.toString()) : 'Unknown error'
      if (err && err.status) {
        context.status = err.status
      } else {
        context.status = 500
        if (!config.quiet) context.app.emit('error', err, context)
      }
    }
  }
}

export class CoreApp {
  instance: Server
  server: Koa
  services: ICoreServices

  get port(): number {
    return this.instance.address().port
  }

  // constructor
  constructor(public config: ICoreConfig, public customServices?: Record<string, CoreService>) {
    const s: any = {}
    each<any>(extend(coreServices, this.customServices), (TheService, name) => {
      s[name] = new TheService(this.config, s)
    })
    this.services = s
  }

  // initialize everything
  async init(): Promise<void> {
    await this.initServer()
    await this.initServices()
  }

  // start the server
  async listen(): Promise<void> {
    if (this.instance) throw new Error('Server is already listening.')
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

  async destroy(): Promise<void> {
    if (this.instance) await this.close()
    eachAsync(this.services, async s => {
      if (s.destroy) await s.destroy()
    })
  }

  // initialize the server
  protected async initServer(): Promise<void> {
    this.server = new Koa()
    if (this.config.keys) this.server.keys = this.config.keys
    if (!this.config.quiet) this.server.use(logger())
    this.server.use(errorReporter(this.config))
    // this.server.use(cacheControl({ noCache: true }))
    this.server.use(bodyParser())
    this.server.use(session({ store: this.services.cache.sessionStore }))
  }

  // initialize and install all services
  protected async initServices(): Promise<void> {

    // beforeInit
    await eachAsync<CoreService>(this.services, async service => {
      if (service.beforeInit) return service.beforeInit()
    })

    // init
    await eachAsync<CoreService>(this.services, async (service, name) => {
      if (service.init) return service.init()
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
