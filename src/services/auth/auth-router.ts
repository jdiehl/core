import * as Router from 'koa-router'

import { ICoreConfig, ICoreContext, ICoreServices } from '../../core-interface'

export function makeRouter(config: ICoreConfig, services: ICoreServices) {
  const prefix = config.auth!.prefix || '/auth'
  const router = new Router({ prefix })

  // login
  router.post('/', async (context: ICoreContext) => {
    const { email, password, redirect } = context.request.body
    const user = await(services.auth.login(email, password))
    if (!user) return context.throw(401)
    if (redirect) return context.redirect(redirect)
    context.status = 200
  })

  // ...

  return router
}
