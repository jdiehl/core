export interface ITokenOptions {
  useCount?: number
  validFor?: string
}

export interface ITokenInfo<T = any> {
  reference: T
  usesLeft?: number
  validUntil?: number
}
