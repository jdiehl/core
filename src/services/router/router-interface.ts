export interface IRouterConfig {
  models?: string[]
}

export interface IRouterOptions {
  prefix?: string
  redirect?: Record<string, string>
}
