import * as Koa from 'koa'
import { crypto } from 'mz'

import { ICoreContext } from '../../core-interface'
import { CoreModel } from '../../core-model'
import { Get, Post } from '../router/router-decorators'
import { IAuthToken, IUser, IUserInternal } from './auth-interface'

export class ErrorUnauthorized extends Error {
  status = 401
  message = 'Unauthorized'
}

export class AuthService<Profile = {}> extends CoreModel<IUserInternal<Profile>, IUser<Profile>> {
  protected collectionName: string

  async login(email: string, password: string): Promise<IUser<Profile>> {
    const user = await this.collection.findOne({ email })
    if (!user) throw new ErrorUnauthorized()
    if (!user.verified) throw new ErrorUnauthorized()
    const hash = await this.makeHash(user.salt, this.config.auth!.secret, password)
    if (hash !== user.hash) throw new ErrorUnauthorized()
    return this.transform(user)
  }

  async verify(token: string): Promise<void> {
    const info = await this.services.token.use<IAuthToken>(token)
    if (!info || info.type !== 'signup') throw new ErrorUnauthorized()
    const userId = this.services.db.objectID(info.user)
    const res = await this.collection.updateOne({ _id: userId }, { $set: { verified: true } })
    if (res.modifiedCount !== 1) throw new Error('Could not verify user')
  }

  // CoreService

  // require user to be present for all methods
  async before(context: ICoreContext, key: keyof AuthService, params: any): Promise<void> {
    if (!context.user) {
      console.log(401)
      throw new ErrorUnauthorized()
    }
  }

  async init() {
    if (!this.config.auth) return
    this.collectionName = this.config.auth.collection || 'auth'
    await super.init()
    this.collection.createIndex(['email'], { unique: true })

    // router
    if (!this.router) return
    this.router.post('/login', async context => await this.loginRoute(context))
    this.router.post('/logout', async context => await this.logoutRoute(context))
    this.router.get('/verify/:token', async context => await this.verifyRoute(context))
    this.router.get('/user', async (context: ICoreContext) => context.user)
    if (this.config.auth.prefix) this.router.prefix(this.config.auth.prefix)
  }

  install(server: Koa) {
    server.use(async (context: ICoreContext, next: () => Promise<any>) => {
      if (context.session.user) {
        const user = await this.findOne(context.session.user)
        if (user) {
          context.user = user
        } else {
          context.session.user = undefined
        }
      }
      return next()
    })
  }

  // CoreModel

  protected async beforeUpdate(id: string, profile: any): Promise<any> {
    return { profile }
  }

  protected async beforeInsert(obj: any): Promise<any> {
    const { password, email, role, profile } = obj
    const salt = await this.makeSalt()
    const hash = await this.makeHash(salt, this.config.auth!.secret, password)
    const user: any = { email, salt, hash, role }
    if (profile) user.profile = profile
    if (!this.config.auth!.verifyEmail) user.verified = true
    return user
  }

  protected async afterInsert(userInternal: IUserInternal<Profile>): Promise<IUserInternal<Profile>> {
    if (!this.config.auth!.verifyEmail) return userInternal
    const reference: IAuthToken = { type: 'signup', user: userInternal._id.toString() }
    const token = await this.services.token.create(reference, { useCount: 1, validFor: '1d' })
    const subject = 'Please confirm your email address'
    const user = await this.transform(userInternal)
    this.services.email.sendTemplate('signup', { user, token }, { subject, to: userInternal.email })
    return userInternal
  }

  protected async transform(userInternal: IUserInternal<Profile>): Promise<IUser<Profile>> {
    const { _id, email, profile, role } = userInternal
    const user: IUser = { _id, email, role }
    if (profile) user.profile = profile
    return user
  }

  // routes

  protected async loginRoute(context: ICoreContext) {
    const { email, password } = context.request.body
    const user = await this.login(email, password)
    context.session.user = user._id.toString()
    context.status = 200
  }

  protected async logoutRoute(context: ICoreContext) {
    delete context.user
    delete context.session.user
    context.status = 200
  }

  protected async verifyRoute(context: ICoreContext) {
    await this.verify(context.params.token)
    context.status = 200
  }

  // protected

  protected async makeSalt(): Promise<string> {
    const { saltlen, encoding } = this.config.auth!
    const buf = await crypto.randomBytes(saltlen || 512)
    return buf.toString(encoding || 'base64')
  }

  protected async makeHash(salt: string, ...args: string[]): Promise<string> {
    const { iterations, keylen, digest, encoding } = this.config.auth!
    const password = args.join()
    const buf = await crypto.pbkdf2(password, salt, iterations || 10000, keylen || 512, digest || 'sha512')
    return buf.toString(encoding || 'base64')
  }

}
