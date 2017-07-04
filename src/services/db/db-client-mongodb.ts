import { Collection, Db, MongoClient } from 'mongodb'
import { Url } from 'url'

import { IDbClient, IDbCollection } from './db-interface'

export class DbClientMongodb implements IDbClient {
  private client: Db

  async init(config: string) {
    this.client = await MongoClient.connect(config)
  }

  async destroy() {
    await this.client.close()
  }

  collection<T>(name: string): IDbCollection<T> {
    const client = this.client.collection<T>(name)
    return client
  }

  async drop(name: string): Promise<boolean> {
    return this.client.dropCollection(name)
  }

}
