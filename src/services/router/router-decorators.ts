import { each, getKeyPath } from '@-)/utils'
import { Request, Response } from 'koa'
import * as KoaRouter from 'koa-router'

import { CoreService } from '../../core-service'
import { IRouterOptions } from './router-interface'

export type RouteMethod = 'get' | 'post' | 'put' | 'delete'
export type RouteMappingFunction = (context: KoaRouter.IRouterContext) => string[]

function createRouter(target: CoreService): KoaRouter {
  if (!target.router) target.router = new KoaRouter()
  return target.router
}

export function Router(options?: IRouterOptions) {
  return (constructor: Function) => {
    const router = createRouter(constructor.prototype)
    if (options) {
      if (options.prefix) router.prefix(options.prefix)
      each<string>(options.redirect, (to, from) => { router.redirect(from, to) })
    }
  }
}

export function Route(method: RouteMethod, path: string, paramMapping?: string[] | RouteMappingFunction) {
  return (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => {
    const router = createRouter(target)
    router[method](path, async context => {

      // map request parameters to method parameters
      let mapping: string[]
      if (typeof paramMapping === 'function') {
        mapping = paramMapping(context)
      } else {
        mapping = paramMapping || []
      }
      if (!(mapping instanceof Array)) mapping = [mapping]
      const params = mapping.map(key => getKeyPath(context, key))

      // process before
      if (target.before) {
        await target.before(context, propertyKey, params)
      }

      // execute method
      let res = target[propertyKey].apply(target, params)
      if (res instanceof Promise) res = await res

      // process after
      if (target.after) {
        res = await target.after(context, propertyKey, res)
      }

      // serve result
      context.body = res
    })
  }
}

export function Get(path: string, paramMapping?: string[] | RouteMappingFunction) {
  return Route('get', path, paramMapping)
}
export function Post(path: string, paramMapping?: string[] | RouteMappingFunction) {
  return Route('post', path, paramMapping)
}
export function Put(path: string, paramMapping?: string[] | RouteMappingFunction) {
  return Route('put', path, paramMapping)
}
export function Delete(path: string, paramMapping?: string[] | RouteMappingFunction) {
  return Route('delete', path, paramMapping)
}
