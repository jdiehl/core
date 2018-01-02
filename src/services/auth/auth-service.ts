import * as Koa from 'koa'

import { CoreService } from '../../core-service'
import { ErrorUnauthorized } from '../../errors'
import { IUser } from '../user/user-interface'
import { IAuthToken } from './auth-interface'

export class AuthService<Profile = {}> extends CoreService {

  // CoreService

  async init() {
    if (!this.config.auth) return
    if (this.services.router) this.setupRouter()
  }

  setupRouter() {
    const { prefix, verifyEmail } = this.config.auth!
    const router = this.services.router.router(prefix || 'auth')

    // fetch user
    router.get('/', async context => {
      if (!context.user) throw new ErrorUnauthorized()
      context.body = context.user
    })

    // update user
    router.post('/', async context => {
      if (!context.user) throw new ErrorUnauthorized()
      await this.services.user.update(context.user._id.toString(), context.request.body)
      context.status = 204
    })

    router.post('/login', async context => {
      const { email, password } = context.request.body
      const user = await this.services.user.authenticate(email, password) as any
      context.session.user = await this.services.user.serialize(user)
      context.body = user
    })

    router.post('/logout', async context => {
      delete context.session.user
      context.status = 204
    })

    router.post('/signup', async context => {
      const { email, password } = context.request.body
      const role = 'user'
      const verified = !verifyEmail
      const user = await this.services.user.insert({ email, password, verified, role })
      if (!verified) {
        const id = await this.services.user.serialize(user)
        const reference: IAuthToken = { type: 'signup', user: id }
        const token = await this.services.token.create(reference, { useCount: 1, validFor: '2w' })
        const subject = 'Please confirm your email address'
        this.services.email.sendTemplate('signup', { user, token }, { subject, to: user.email })
      }
      context.body = user
    })

    router.get('/verify/:token', async context => {
      const { token } = context.params
      const info = await this.services.token.use<IAuthToken>(token)
      if (!info || info.type !== 'signup') throw new ErrorUnauthorized()
      await this.services.user.verify(info.user)
      context.status = 204
    })

    this.services.server.use(async (context: any, next: () => Promise<any>) => {
      if (context.session.user) {
        const user = await this.services.user.unserialize(context.session.user)
        user ? context.user = user : delete context.session.user
      }
      return next()
    })
  }

}
