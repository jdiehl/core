import { IUser } from './services/auth/auth-interface'

declare module 'koa' {
  // tslint:disable-next-line:interface-name
  interface Request {
    body: any
  }
  // tslint:disable-next-line:interface-name
  interface Context {
    user?: IUser<any>
    session: any
    sessionHandler: { regenerateId: () => void }
  }
}
