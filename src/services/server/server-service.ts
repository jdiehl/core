import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as cacheControl from 'koa-cache-control'
import * as logger from 'koa-logger'
import * as session from 'koa-session-minimal'
import { Server } from 'net'

import { ICoreConfig } from '../../core-interface'
import { CoreService } from '../../core-service'

export class ServerService extends CoreService {
  instance!: Server
  server!: Koa

  async beforeInit() {
    this.server = new Koa()
    if (this.config.keys) this.server.keys = this.config.keys
    if (!this.config.quiet) this.server.use(logger())
    this.server.use(errorReporter(this.config))
    // this.server.use(cacheControl({ noCache: true }))
    this.server.use(bodyParser())
    this.server.use(session({ store: this.services.cache.sessionStore }))
  }

  async startup(): Promise<void> {
    if (this.instance) throw new Error('Server is already listening.')
    return new Promise<void>((resolve, reject) => {
      this.instance = this.server.listen(this.config.port, resolve)
      this.instance.on('error', (err: Error) => reject(err))
    })
  }

  async destroy(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.instance.close((err: Error) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  get port(): number | undefined {
    return this.instance ? this.instance.address().port : undefined
  }

  use(middleware: any) {
    this.server.use(middleware)
  }

}

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
