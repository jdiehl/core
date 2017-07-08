import { each, getKeyPath } from '@-)/utils'
import { Request, Response } from 'koa'
import * as KoaRouter from 'koa-router'

import { CoreService } from '../../core-service'
import { IRouterOptions } from './router-interface'

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

export function Route(method: 'get' | 'post' | 'put' | 'delete', path: string, paramMapping?: string[]) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const router = createRouter(target)
    router[method](path, async context => {
      const params = (paramMapping || []).map(key => getKeyPath(context, key))
      let res = target[propertyKey].apply(target, params)
      if (res instanceof Promise) res = await res
      context.body = res
    })
  }
}

export function Get(path: string, paramMapping?: string[]) { return Route('get', path, paramMapping) }
export function Post(path: string, paramMapping?: string[]) { return Route('post', path, paramMapping) }
export function Put(path: string, paramMapping?: string[]) { return Route('put', path, paramMapping) }
export function Delete(path: string, paramMapping?: string[]) { return Route('delete', path, paramMapping) }
