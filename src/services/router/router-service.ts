import { CoreModel } from '../../core-model'
import { CoreService } from '../../core-service'
import { Delete, Get, Post, Put } from './router-decorators'

export * from './router-decorators'

export class RouterService extends CoreService {

  async init() {
    if (!this.config.router) return
    const { models } = this.config.router
    if (!models) return

    for (const prefix of models) {
      const model = (this.services as any)[prefix]
      this.createRouter(model, prefix)
    }
  }

  private createRouter(model: CoreModel, prefix: string) {

    Post('/', ['request.body'])(model, 'insert')
    model.router!.get('/', async (context) => {
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
    // Get('/', ['query'])(model, 'find')
    Get('/:id', ['params.id'])(model, 'findOne')
    Put('/:id', ['params.id', 'request.body'])(model, 'update')
    Delete('/:id', ['params.id'])(model, 'delete')
    model.router!.prefix(prefix)
  }
}
