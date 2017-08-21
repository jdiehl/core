export interface IAuthConfig {
  prefix?: string
  verifyEmail?: boolean
}

export interface IAuthToken {
  type: 'signup'
  user: string
}
