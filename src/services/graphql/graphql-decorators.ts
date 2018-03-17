export type GraphQLContextFunction = (context: any) => any
export interface IGraphQLQueryConfig {
  name: string
  type?: string
  args?: { [name: string]: string | GraphQLContextFunction }
}

function setup(target: any) {
  if (!target.graphql) {
    target.graphql = { queries: {}, mutations: {} } as any
  }
}

export function Query(config: IGraphQLQueryConfig) {
  return (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => {
    setup(target)
    target.graphql.queries[propertyKey] = config
  }
}

export function Mutation(config: IGraphQLQueryConfig) {
  return (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => {
    target.graphql.mutations[propertyKey] = config
  }
}
