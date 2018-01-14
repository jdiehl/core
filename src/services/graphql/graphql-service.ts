import { each } from '@didie/utils'
import * as Router from 'koa-router'
const koaGraphql = require('koa-graphql')

import { CoreService } from '../../core-service'
import { Model } from '../model/model'
import { GraphQLSchemaBuilder } from './graphql-schema-builder'

export interface IGraphQLConfig {
  graphiql?: boolean
  models: string[]
}

export class GraphQLService extends CoreService {
  private builder: GraphQLSchemaBuilder

  // CoreService

  async init(): Promise<void> {
    if (!this.config.graphql) return
    this.builder = new GraphQLSchemaBuilder()
  }

  addModel(model: Model) {
    this.builder.addModel(model)
  }

  async startup(): Promise<void > {
    if (!this.config.graphql) return
    const { models, graphiql } = this.config.graphql

    // build model interfaces from config
    for (const name of models) {
      this.addModel(this.services.model.get(name))
    }

    // build the schema
    const schema = this.builder.build()

    // install graphql
    const router = new Router()
    router.all('/graphql', koaGraphql({ schema, graphiql }))
    this.services.server.use(router.routes())
    this.services.server.use(router.allowedMethods())
  }

}
