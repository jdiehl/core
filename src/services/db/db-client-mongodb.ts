import { connect, Db, ObjectID } from 'mongodb'
import { Url } from 'url'

import { IDbClient, IDbCollection, IDbObjectID } from './db-interface'

export class DbClientMongodb implements IDbClient {
  private client!: Db

  async init(config: string) {
    this.client = await connect(config)
  }

  async destroy() {
    if (this.client) await (this.client as any).close()
  }

  collection<T>(name: string): IDbCollection<T> {
    return this.client.collection<T>(name) as any
  }

  async drop(name: string): Promise<boolean> {
    return this.client.dropCollection(name)
  }

  objectID(id: string): IDbObjectID {
    return new ObjectID(id)
  }

}
