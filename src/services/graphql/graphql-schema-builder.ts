import { each } from '@didie/utils'
import { GraphQLBoolean, GraphQLFieldConfigMap,  GraphQLInt, GraphQLList, GraphQLNonNull,
GraphQLObjectType, GraphQLSchema, GraphQLString, } from 'graphql'

import { Model } from '../model/model'

export class GraphQLSchemaBuilder {
  private queries: GraphQLFieldConfigMap<any, any> = {}
  private mutations: GraphQLFieldConfigMap<any, any> = {}
  private types: GraphQLObjectType[] = []

  // add a model to the builder
  addModel(model: Model) {
    const { name } = model
    const Name = name[0].toUpperCase() + name.substr(1)

    // type
    const type = new GraphQLObjectType({
      fields: this.fieldsFromModel(model),
      name
    })
    this.types.push(type)

    // find
    this.queries[`${name}s`] = {
      resolve: async () => model.find(),
      type: new GraphQLList(type)
    }

    // findOne
    this.queries[name] = {
      args: { _id: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: async (root, { _id }) => await model.findOne(_id),
      type
    }

    // insert
    this.mutations[`insert${Name}`] = {
      args: this.fieldsFromModel(model, 'insert'),
      resolve: async (root, obj) => await model.insert(obj),
      type
    }

    // update
    this.mutations[`update${Name}`] = {
      args: this.fieldsFromModel(model, 'update'),
      resolve: async (root, { _id, ...obj }) => {
        await model.update(_id, obj)
        return true
      },
      type: GraphQLBoolean
    }

    // delete
    this.mutations[`delete${Name}`] = {
      args: { _id: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: async (root, { _id }) => {
        await model.delete(_id)
        return true
      },
      type: GraphQLBoolean
    }
  }

  build() {
    const options: any = {}

    // add queries
    if (this.queries) options.query = new GraphQLObjectType({
      fields: this.queries,
      name: 'Query'
    })

    // add mutations
    if (this.mutations) options.mutation = new GraphQLObjectType({
      fields: this.mutations,
      name: 'Mutation'
    })

    // add types
    if (this.types) options.types = this.types

    return new GraphQLSchema(options)
  }

  // generate the graphql fields for a given model
  private fieldsFromModel(model: Model, mode: 'all' | 'insert' | 'update' = 'all') {
    const fields: any = {}
    if (mode !== 'insert') fields._id = { type: new GraphQLNonNull(GraphQLString) }
    each(model.spec, (value, key) => {
      let type: any = this.typeFromSpec(value)
      if (mode !== 'update') type = new GraphQLNonNull(type)
      fields[key] = { type }
    })
    return fields
  }

  // get the graphql for a spec field
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
