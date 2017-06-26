import { Collection, Db, MongoClient } from 'mongodb'
import { CoreService } from '../core-interface'

export class MongoService extends CoreService {

  private db: Db

  async beforeInit() {
    if (this.config.database) this.db = await MongoClient.connect(this.config.database)
  }

  collection<T>(name: string): Collection<T> {
    return this.db.collection<T>(name)
  }

  async close() {
    await this.db.close()
  }

}
