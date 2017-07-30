import * as Koa from 'koa'

import { ICoreContext } from '../../core-interface'
import { CoreService } from '../../core-service'
import { Router } from '../router/router-decorators'
import { IUser } from '../user/user-interface'
import { ErrorUnauthorized } from '../user/user-service'
import { IAuthToken } from './auth-interface'

@Router()
export class AuthService<Profile = {}> extends CoreService {

  // CoreService

  async init() {
    if (this.config.auth && this.config.auth.prefix) this.router!.prefix(this.config.auth.prefix)
    this.router!.get('/', async context => await this.userRoute(context))
    this.router!.post('/', async context => await this.updateRoute(context))
    this.router!.post('/login', async context => await this.loginRoute(context))
    this.router!.post('/logout', async context => await this.logoutRoute(context))
    this.router!.post('/signup', async context => await this.signupRoute(context))
    this.router!.get('/verify/:token', async context => await this.verifyRoute(context))
  }

  install(server: Koa) {
    server.use(async (context: ICoreContext, next: () => Promise<any>) => {
      if (context.session.user) {
        const user = await this.services.user.unserialize(context.session.user)
        user ? context.user = user : delete context.session.user
      }
      return next()
    })
  }

  // routes

  protected async userRoute(context: ICoreContext) {
    if (!context.user) throw new ErrorUnauthorized()
    context.body = context.user
  }

  protected async updateRoute(context: ICoreContext) {
    if (!context.user) throw new ErrorUnauthorized()
    await this.services.user.update(context.user._id, context.request.body)
    context.status = 200
  }

  protected async loginRoute(context: ICoreContext) {
    const { email, password } = context.request.body
    const user = await this.services.user.authenticate(email, password) as any
    context.session.user = await this.services.user.serialize(user)
    context.body = user
  }

  protected async logoutRoute(context: ICoreContext) {
    delete context.session.user
    context.status = 200
  }

  protected async signupRoute(context: ICoreContext) {
    const { email, password } = context.request.body
    const role = 'user'
    const verified = !(this.config.auth && this.config.auth.verifyEmail)
    const user = await this.services.user.insert({ email, password, verified, role })
    if (!verified) {
      const id = await this.services.user.serialize(user)
      const reference: IAuthToken = { type: 'signup', user: id }
      const token = await this.services.token.create(reference, { useCount: 1, validFor: '2w' })
      const subject = 'Please confirm your email address'
      this.services.email.sendTemplate('signup', { user, token }, { subject, to: user.email })
    }
    context.body = user
  }

  protected async verifyRoute(context: ICoreContext) {
    const { token } = context.params
    const info = await this.services.token.use<IAuthToken>(token)
    if (!info || info.type !== 'signup') throw new ErrorUnauthorized()
    await this.services.user.verify(info.user)
    context.status = 200
  }

}
