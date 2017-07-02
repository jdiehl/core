import * as Koa from 'koa'
import { CoreService, ICoreContext } from '../../core-interface'
import { IDbCollection } from '../db-service/db-client'

export interface IStats {
  method: string
  path: string
  userId?: string
  params: any
  body: any
}

export class StatsService extends CoreService {
  stats: IDbCollection

  async init() {
    this.stats = this.services.db.collection<IStats>('stats')
  }

  install(server: Koa): void {
    server.use(async (context: ICoreContext, next: () => void) => {
      await next()
      await this.store(context)
    })
  }

  async store(context: ICoreContext): Promise<void> {
    const { user, method, path, params, body } = context
    if (body && body.password) body.password = '######'
    const userId = user ? user._id : undefined
    await this.stats.insertOne({ userId, method, path, params, body })
  }

}
