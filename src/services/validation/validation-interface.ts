export interface IValidationConfig {
  // nothing
}

export type Validator = (value: any) => boolean
export type ValidatorType = 'number' | 'boolean' | 'string' | 'email' | 'any'

export interface IValidationSpec {
  [key: string]: Validator | ValidatorType
}
