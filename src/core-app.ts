import { each, eachAsync, extend } from '@didie/utils'
import * as Router from 'koa-router'

import { ICoreConfig, ICoreServices } from './core-interface'
import { CoreService } from './core-service'

import { coreServices } from './services'

export class CoreApp {
  services: ICoreServices

  get port(): number | undefined {
    return this.services.server.port
  }

  // constructor
  constructor(public config: ICoreConfig, public customServices?: Record<string, CoreService>) {
    const s: any = {}
    each<any>(extend(coreServices, this.customServices), (TheService, name) => {
      s[name] = new TheService(this.config, s)
    })
    this.services = s
  }

  // initialize everything
  async init(): Promise<void> {

    // beforeInit
    await eachAsync<CoreService>(this.services, async service => {
      if (service.beforeInit) return service.beforeInit()
    })

    // init
    await eachAsync<CoreService>(this.services, async (service, name) => {
      if (service.init) return service.init()
    })

    // install
    if (this.services.server.server) {
      const router = new Router({ prefix: this.config.prefix })
      each<CoreService>(this.services, service => {
        if (service.install) service.install(this.services.server.server)
        if (service.router) router.use(service.router.routes(), service.router.allowedMethods())
      })
      this.services.server.use(router.routes())
      this.services.server.use(router.allowedMethods())
    }

    // startup
    await eachAsync<CoreService>(this.services, async (service, name) => {
      if (service.startup) return service.startup()
    })

  }

  async destroy(): Promise<void> {
    eachAsync(this.services, async s => {
      if (s.destroy) await s.destroy()
    })
  }

}
