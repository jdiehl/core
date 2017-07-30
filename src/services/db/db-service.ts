import * as url from 'url'

import { CoreService } from '../../core-service'
import { DbClientMongodb } from './db-client-mongodb'
import { IDbClient, IDbCollection, IDbObjectID } from './db-interface'

export class DbService extends CoreService {
  private client: IDbClient

  collection<T>(name: string): IDbCollection<T> {
    return this.client.collection<T>(name)
  }

  async drop(name: string): Promise<boolean> {
    return this.client.drop(name)
  }

  objectID(id: string): IDbObjectID {
    return this.client.objectID(id)
  }

  // CoreService

  async beforeInit() {
    if (!this.config.db) return
    const dbUrl = url.parse(this.config.db)
    if (!dbUrl) return
    this.client = this.createClient(dbUrl)
    await this.client.init(this.config.db)
  }

  async destroy() {
    if (this.client) await this.client.destroy()
  }

  // private

  private createClient(dbUrl: url.Url): IDbClient {
    switch (dbUrl.protocol) {
    case 'mongodb:': return new DbClientMongodb()
    default: throw new Error('Invalid db type')
    }
  }

}
