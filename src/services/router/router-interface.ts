export interface IRouterConfig {
  prefix?: string
}

export interface IRouterOptions {
  prefix?: string,
  redirect?: Record<string, string>
}
