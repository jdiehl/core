import { each } from '@didie/utils'
import * as Router from 'koa-router'
const koaGraphql = require('koa-graphql')

import { GraphQLFieldConfig } from 'graphql'
import { CoreService } from '../../core-service'
import { Model } from '../model/model'
import { GraphQLSchemaBuilder } from './graphql-schema-builder'

export * from './graphql-decorators'

export interface IGraphQLConfig {
  graphiql?: boolean
  models?: string[]
}

export class GraphQLService extends CoreService {
  private builder!: GraphQLSchemaBuilder

  // CoreService

  async init(): Promise<void> {
    if (!this.config.graphql) return
    this.builder = new GraphQLSchemaBuilder()
  }

  addType(model: Model) {
    this.builder.addType(model)
  }

  addQuery(name: string, config: GraphQLFieldConfig<any, any>) {
    this.builder.addQuery(name, config)
  }

  addMutation(name: string, config: GraphQLFieldConfig<any, any>) {
    this.builder.addMutation(name, config)
  }

  addModel(model: Model) {
    this.builder.addModel(model)
  }

  async startup(): Promise<void > {
    if (!this.config.graphql) return
    const { models, graphiql } = this.config.graphql

    // build model interfaces from config
    if (models) for (const name of models) {
      this.addModel(this.services.model.get(name))
    }

    each(this.services, service => {
      if (service.graphql) this.builder.fromConfig(service)
    })

    // build the schema
    const schema = this.builder.build()

    // install graphql
    const router = new Router()
    router.all('/graphql', koaGraphql({ schema, graphiql }))
    this.services.server.use(router.routes())
    this.services.server.use(router.allowedMethods())
  }

}
