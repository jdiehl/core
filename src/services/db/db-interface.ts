import { Url } from 'url'

export interface IDbObjectID {
  toString(): string
}

export interface IDbObject {
  _id: IDbObjectID
}

export interface IDbDeleteResult {
  deletedCount?: number
}

export interface IDbInsertResult {
  insertedCount: number
  insertedIds: IDbObjectID[]
}

export interface IDbInsertOneResult {
  insertedCount: number
  insertedId: IDbObjectID
}

export interface IDbUpdateResult {
  modifiedCount: number
  upsertedCount: number
  upsertedId: { _id: IDbObjectID }
}

export interface IDbIndexOptions {
  unique?: boolean
  sparse?: boolean
  name?: string
}

export interface IDbUpdateOptions {
  upsert?: boolean
}

export interface IDbCursor<T = any> {
  count(applySkipLimit: boolean): Promise<number>
  filter(filter: object): IDbCursor<T>
  limit(value: number): IDbCursor<T>
  map(transform: Function): IDbCursor<T>
  next(): Promise<T>
  project(value: object): IDbCursor<T>
  skip(value: number): IDbCursor<T>
  sort(key: string, direction: 1 | -1): IDbCursor<T>
  sort(list: object[] | object): IDbCursor<T>
  toArray(): Promise<T[]>
}

export interface IDbCollection<TSchema = any> {
  count(query: object): Promise<number>
  createIndex(fieldOrSpec: string | any, options?: IDbIndexOptions): Promise<string>
  deleteMany(filter: object): Promise<IDbDeleteResult>
  deleteOne(filter: object): Promise<IDbDeleteResult>
  drop(): Promise<void>
  dropIndex(indexName: string): Promise<void>
  find<T = TSchema>(query?: object): IDbCursor<T>
  findOne<T = TSchema>(filter: object): Promise<T>
  insertMany(docs: object[]): Promise<IDbInsertResult>
  insertOne(docs: object): Promise<IDbInsertOneResult>
  updateMany(filter: object, update: object, options?: IDbUpdateOptions): Promise<IDbUpdateResult>
  updateOne(filter: object, update: object, options?: IDbUpdateOptions): Promise<IDbUpdateResult>
}

export interface IDbClient {
  init(config: string): Promise<void>
  destroy(): Promise<void>
  drop(name: string): Promise<boolean>
  collection<T>(name: string): any
  objectID(id: string): IDbObjectID
}
