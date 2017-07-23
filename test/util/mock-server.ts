import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as session from 'koa-session-minimal'

import { Server } from 'net'
import { CoreService } from '../../'
import { errorReporter } from '../../src/core-app'

export async function mockServer(service: CoreService, install?: (app: Koa) => void): Promise<Server> {
  return new Promise<Server>((resolve, reject) => {
    const app = new Koa()
    app.use(bodyParser())
    app.use(session())
    app.use(errorReporter)
    if (install) install(app)
    if (service.router) {
      app.use(service.router.routes())
      app.use(service.router.allowedMethods())
    }
    const server = app.listen(() => resolve(server))
  })

}
