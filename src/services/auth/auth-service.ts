import * as Koa from 'koa'

import { ICoreContext } from '../../core-interface'
import { CoreService } from '../../core-service'
import { ErrorUnauthorized } from '../../errors'
import { Get, Post, Router } from '../router/router-decorators'
import { IUser } from '../user/user-interface'
import { IAuthToken } from './auth-interface'

@Router()
export class AuthService<Profile = {}> extends CoreService {

  // CoreService

  async init() {
    const { auth } = this.config
    const prefix = auth && auth.prefix ? auth.prefix : 'auth'
    this.router!.prefix(prefix)

    // TODO: Replace this with @Get / @Post
    // Currently, this is not correctly set.
    Get('/')(this, 'userRoute')
    Post('/')(this, 'updateRoute')
    Post('/login')(this, 'loginRoute')
    Post('/logout')(this, 'logoutRoute')
    Post('/signup')(this, 'signupRoute')
    Get('/verify/:token')(this, 'verifyRoute')

    this.services.server.use(async (context: ICoreContext, next: () => Promise<any>) => {
      if (context.session.user) {
        const user = await this.services.user.unserialize(context.session.user)
        user ? context.user = user : delete context.session.user
      }
      return next()
    })
  }

  // routes

  // @Get('/')
  async userRoute(context: ICoreContext) {
    if (!context.user) throw new ErrorUnauthorized()
    return context.user
  }

  // @Post('/')
  async updateRoute(context: ICoreContext) {
    if (!context.user) throw new ErrorUnauthorized()
    await this.services.user.update(context.user._id.toString(), context.request.body)
  }

  // @Post('/login')
  async loginRoute(context: ICoreContext) {
    const { email, password } = context.request.body
    const user = await this.services.user.authenticate(email, password) as any
    context.session.user = await this.services.user.serialize(user)
    return user
  }

  // @Post('/logout')
  async logoutRoute(context: ICoreContext) {
    delete context.session.user
  }

  // @Post('/signup')
  async signupRoute(context: ICoreContext) {
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
    return user
  }

  // @Get('/verify/:token')
  async verifyRoute(context: ICoreContext) {
    const { token } = context.params
    const info = await this.services.token.use<IAuthToken>(token)
    if (!info || info.type !== 'signup') throw new ErrorUnauthorized()
    await this.services.user.verify(info.user)
  }

}
