import { IDbObject } from '../db/db-interface'

export interface IStatsConfig {
  collection: string
  includeHeader?: string[]
}

export interface IStats extends IDbObject {
  date: Date
  time: number
  method: string
  path: string
  userId?: string
  params: Record<string, string>
  query: Record<string, string>
  body: any
  header?: Record<string, string>
}
