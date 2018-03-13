import { crypto } from 'mz'

import { CoreService } from '../../core-service'
import { ErrorUnauthorized } from '../../errors'
import { Model } from '../model/model-service'
import { IAuthToken, IUser } from './auth-interface'
import { User } from './user'

export * from './user'

export class AuthService<Profile = {}> extends CoreService {
  private user!: User

  async makeSalt(): Promise<string > {
    const { saltlen, encoding } = this.config.auth!
    const buf = await crypto.randomBytes(saltlen || 512)
    return buf.toString(encoding || 'base64')
  }

  async makeHash(salt: string, password: string): Promise<string > {
    if (!salt) throw new Error('Missing Salt')
    const { iterations, keylen, digest, encoding } = this.config.auth!
    const input = this.config.auth!.secret + ',' + password
    const buf = await crypto.pbkdf2(input, salt, iterations || 10000, keylen || 512, digest || 'sha512')
    return buf.toString(encoding || 'base64')
  }

  // CoreService

  async init() {
    if (!this.config.auth) return
    this.user = this.services.model.add<User>('user', User.spec, User)
    if (this.services.router) this.setupRouter()
  }

  // Private

  private setupRouter() {
    const { prefix, verifyEmail } = this.config.auth!
    const router = this.services.router.add(prefix || 'auth')

    // fetch user
    router.get('/', async context => {
      if (!context.user) throw new ErrorUnauthorized()
      context.body = context.user
    })

    // update user
    router.post('/', async context => {
      if (!context.user) throw new ErrorUnauthorized()
      await this.user.update(context.user._id.toString(), context.request.body)
      context.status = 204
    })

    // login
    router.post('/login', async context => {
      const { email, password } = context.request.body
      const user = await this.user.authenticate(email, password) as any
      context.session.user = await this.user.serialize(user)
      context.body = user
    })

    // logout
    router.post('/logout', async context => {
      delete context.session.user
      context.status = 204
    })

    // signup
    router.post('/signup', async context => {
      const { email, password } = context.request.body
      const verified = !verifyEmail
      const user = await this.user.insert({ email, password, verified })
      if (!verified) {
        const id = await this.user.serialize(user)
        const reference: IAuthToken = { type: 'signup', user: id }
        const token = await this.services.token.create(reference, { useCount: 1, validFor: '2w' })
        const subject = 'Please confirm your email address'
        this.services.email.sendTemplate('signup', { user, token }, { subject, to: user.email })
      }
      context.body = user
    })

    // verify
    router.get('/verify/:token', async context => {
      const { token } = context.params
      const info = await this.services.token.use<IAuthToken>(token)
      if (!info || info.type !== 'signup') throw new ErrorUnauthorized()
      await this.user.verify(info.user)
      context.status = 204
    })

    // auth middleware
    this.services.server.use(async (context: any, next: () => Promise<any>) => {
      if (context.session.user) {
        const user = await this.user.unserialize(context.session.user)
        user ? context.user = user : delete context.session.user
      }
      return next()
    })
  }

}
