import { map } from '@didie/utils'
import { GraphQLBoolean,  GraphQLFieldConfigMap, GraphQLInt, GraphQLInterfaceType,
GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql'
import * as Router from 'koa-router'

const koaGraphql = require('koa-graphql')

import { CoreService } from '../../core-service'
import { Model } from '../model/model'

export interface IGraphQLConfig {
  graphiql?: boolean
  models: string[]
}

export class GraphQLService extends CoreService {
  private queries: GraphQLFieldConfigMap<any, any> = {}
  private mutation: GraphQLFieldConfigMap<any, any> = {}

  // CoreService

  async init(): Promise<void> {
    if (!this.config.graphql) return
  }

  addModel(model: Model) {
    const { name } = model
    const fields = map(model.spec, (value, key) => ({ type: this.typeFromSpec(value) }))
    const type = new GraphQLInterfaceType({ name, fields })
    this.queries[name] = {
      type: new GraphQLList(type),
      resolve() {
        return [{ title: 'test', completed: false }]
      }
      // async resolve() {
      //   const data = await model.find()
      //   return data
      // }
    }
  }

  async startup(): Promise<void > {
    if (!this.config.graphql) return
    const { graphiql } = this.config.graphql
    const server = this.services.server.server
    if (!server) return

    for (const name of this.config.graphql.models) {
      const model = this.services.model.models[name]
      this.addModel(model)
    }

    const schema = new GraphQLSchema({
      // mutation: new GraphQLObjectType({
      //   fields: this.mutation,
      //   name: 'Mutation'
      // }),
      query: new GraphQLObjectType({
        fields: this.queries,
        name: 'Query'
      })
    })

    const router = new Router()
    router.all('/graphql', koaGraphql({ schema, graphiql }))
    server.use(router.routes())
    server.use(router.allowedMethods())
  }

  private typeFromSpec(spec: any) {
    switch (spec) {
      case 'number': return GraphQLInt
      case 'boolean': return GraphQLBoolean
      case 'string':
      case 'email':
      case 'any':
      default:
        return GraphQLString
    }
  }

}
