import { extend } from '@didie/utils'

import { ICoreContext } from '../../core-interface'
import { CoreService } from '../../core-service'
import { IDbCollection } from '../db/db-interface'
import { IStats } from './stats-interface'

export class StatsService extends CoreService {
  stats!: IDbCollection

  async store(context: ICoreContext, date: Date, time: number): Promise<void> {
    if (!this.config.stats) throw new Error('Missing stats configuration')

    // extract values
    const { user, method, path, params, query } = context
    let { body } = context.request

    // mask password
    if (body && body.password) body = extend(body, { password: '######' })

    // create stats doc
    const doc: Partial<IStats> = { date, time, method, path, params, query, body }

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

  // CoreService

  async init() {
    if (!this.config.stats) return
    this.stats = this.services.db.collection<IStats>(this.config.stats.collection || 'stats')

    this.services.server.use(async (context: ICoreContext, next: () => void) => {
      const start = new Date()
      await next()
      const time = new Date().getTime() - start.getTime()
      await this.store(context, start, time)
    })
  }

}
