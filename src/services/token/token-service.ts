import { stringToDuration } from '@-)/utils'
import { Middleware, Request } from 'koa'
import { crypto } from 'mz'

import { ICoreContext } from '../../core-interface'
import { CoreService } from '../../core-service'
import { ITokenInfo, ITokenOptions } from './token-interface'

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

  async create<T = any>(reference: T, options?: ITokenOptions): Promise<string> {
    const buf = await crypto.randomBytes(64)
    const token = buf.toString('hex')
    const info: ITokenInfo = { reference }
    if (options) {
      if (options.useCount) info.usesLeft = options.useCount
      if (options.validFor) info.validUntil = new Date().getTime() + stringToDuration(options.validFor)
    }
    this.services.cache.set(`token:${token}`, info)
    return token
  }

  async use<T = any>(token: string): Promise<T> {
    const key = `token:${token}`
    const res = await this.services.cache.get(key) as ITokenInfo
    if (!res) throw new Error('Invalid Token')
    if (res.validUntil !== undefined && res.validUntil < new Date().getTime()) {
      await this.services.cache.del(key)
      throw new Error('Invalid Token')
    }
    if (res.usesLeft !== undefined) {
      if (res.usesLeft <= 0) {
        await this.services.cache.del(key)
        throw new Error('Invalid Token')
      }
      res.usesLeft--
      await this.services.cache.set(key, res)
    }
    return res.reference
  }

}
