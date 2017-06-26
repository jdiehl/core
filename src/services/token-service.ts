import { Middleware, Request } from 'koa'
import { CoreService, ICoreContext } from '../core-interface'

export class TokenService extends CoreService {

  require(domain: string | string[]): Middleware {
    if (!this.config.tokens) throw new Error('Missing token configuration')
    if (typeof domain === 'string') domain = [domain]
    return async (context: ICoreContext, next: () => void) => {
      const token = context.request.header['authentication-token']
      for (const d of domain) {
        const check = this.config.tokens![d]
        if (check && check === token) return next()
      }
      context.throw(403, 'Invalid Token')
    }
  }

}
