import { extend } from '@-)/utils'
import * as Koa from 'koa'
import { CoreService, ICoreContext } from '../../core-interface'
import { IDbCollection } from '../db-service/db-client'

export interface IStats {
  method: string
  path: string
  userId?: string
  params: Record<string, string>
  body: any
  header?: Record<string, string>
}

export class StatsService extends CoreService {
  stats: IDbCollection

  async init() {
    if (!this.config.stats) return
    this.stats = this.services.db.collection<IStats>(this.config.stats.collection || 'stats')
  }

  install(server: Koa): void {
    server.use(async (context: ICoreContext, next: () => void) => {
      await next()
      await this.store(context)
    })
  }

  async store(context: ICoreContext): Promise<void> {
    if (!this.config.stats) throw new Error('Missing stats configuration')

    // extract values
    const { user, method, path, params } = context
    let { body } = context

    // mask password
    if (body && body.password) body = extend(body, { password: '######' })

    // create stats doc
    const doc: IStats = { method, path, params, body }

    // add user id
    if (user) doc.userId = user._id.toString()

    // add headers
    if (this.config.stats.includeHeader) {
      doc.header = {}
      for (const key of this.config.stats.includeHeader) {
        if (context.header[key]) doc.header[key] = context.header[key]
      }
    }

    // store doc
    await this.stats.insertOne(doc)
  }

}
