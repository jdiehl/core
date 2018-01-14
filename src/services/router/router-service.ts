import { each } from '@didie/utils'
import * as Router from 'koa-router'

import { CoreService } from '../../core-service'
import { Model } from '../model/model-service'
import { Delete, Get, Post, Put } from './router-decorators'

export * from './router-decorators'

export class RouterService extends CoreService {
  private routers: Router[] = []

  async init() {
  }

  async startup() {
    if (!this.config.router) return
    const { models } = this.config.router

    if (models) {
      if (!this.services.model) throw new Error('Model service is missing.')
      for (const name of models) {
        const model = this.services.model.get(name)
        if (!model) throw new Error(`Model ${name} not found.`)
        this.addModel(name, model)
      }
    }

    // install routers
    if (this.services.server.server) {
      const router = new Router({ prefix: this.config.prefix })
      for (const r of this.routers) {
        router.use(r.routes(), r.allowedMethods())
      }
      this.services.server.use(router.routes())
      this.services.server.use(router.allowedMethods())
    }
  }

  add(prefix: string): Router {
    const router = new Router({ prefix })
    this.routers.push(router)
    return router
  }

  addModel(prefix: string, model: Model): Router {
    const router = this.add(prefix)

    router.get('/', async context => {
      // TODO: compute last-modified
      const modified = new Date() as any
      if (context.header['if-modified-since']) {
        const cache = new Date(context.header['if-modified-since'])
        if (modified <= cache) return context.status = 304
      }
      context.set('last-modified', modified.toGMTString())
      context.set('cache-control', `max-age=0`)
      context.body = await model.find(context.query)
    })

    router.get('/:id', async context => {
      context.body = await model.findOne(context.params.id)
    })

    router.post('/', async context => {
      context.body = await model.insert(context.request.body)
    })

    router.put('/:id', async context => {
      context.body = await model.update(context.params.id, context.request.body)
    })

    router.delete('/:id', async context => {
      context.body = await model.delete(context.params.id)
    })

    return router
  }
}
