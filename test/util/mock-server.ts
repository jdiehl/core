import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'

import { Server } from 'net'
import { CoreService } from '../../'

export async function mockServer(service: CoreService): Promise<Server> {
  return new Promise<Server>((resolve, reject) => {
    const app = new Koa()
    app.use(bodyParser())
    app.use(service.router!.routes())
    app.use(service.router!.allowedMethods())
    const server = app.listen(() => resolve(server))
  })

}
