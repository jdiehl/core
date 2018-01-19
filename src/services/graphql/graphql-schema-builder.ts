import { each, map } from '@didie/utils'
import { GraphQLBoolean, GraphQLFieldConfig, GraphQLFieldConfigMap,  GraphQLInt, GraphQLList, GraphQLNonNull,
GraphQLObjectType, GraphQLSchema, GraphQLString, } from 'graphql'

import { Model } from '../model/model'

export class GraphQLSchemaBuilder {
  private queries: GraphQLFieldConfigMap<any, any> = {}
  private mutations: GraphQLFieldConfigMap<any, any> = {}
  private types: { [name: string]: GraphQLObjectType } = {}

  addType(model: Model): GraphQLObjectType {
    const name = model.name
    const fields = this.fieldsFromModel(model)
    const type = new GraphQLObjectType({ name, fields })
    this.types[name] = type
    return type
  }

  addQuery(name: string, config: GraphQLFieldConfig<any, any>) {
    this.queries[name] = config
  }

  addMutation(name: string, config: GraphQLFieldConfig<any, any>) {
    this.mutations[name] = config
  }

  // add a model to the builder
  addModel(model: Model) {
    const { name } = model
    const Name = name[0].toUpperCase() + name.substr(1)

    // type
    const type = this.addType(model)

    // find
    this.addQuery(`${name}s`, {
      resolve: async () => model.find(),
      type: new GraphQLList(type)
    })

    // findOne
    this.addQuery(name, {
      args: { _id: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: async (root, { _id }) => await model.findOne(_id),
      type
    })

    // insert
    this.addMutation(`insert${Name}`, {
      args: this.fieldsFromModel(model, 'insert'),
      resolve: async (root, obj) => await model.insert(obj),
      type
    })

    // update
    this.addMutation(`update${Name}`, {
      args: this.fieldsFromModel(model, 'update'),
      resolve: async (root, { _id, ...obj }) => {
        await model.update(_id, obj)
        return true
      },
      type: GraphQLBoolean
    })

    // delete
    this.addMutation(`delete${Name}`, {
      args: { _id: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: async (root, { _id }) => {
        await model.delete(_id)
        return true
      },
      type: GraphQLBoolean
    })
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
    if (this.types) {
      options.types = []
      each(this.types, t => options.types.push(t))
    }

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
