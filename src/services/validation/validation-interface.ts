export interface IValidationConfig {
  // nothing
}

export type ValidationMode = 'insert' | 'update'
export type Validator = (obj: any, mode: ValidationMode) => boolean

export type Validate = (obj: any) => boolean
export type ValidatorType = 'number' | 'boolean' | 'string' | 'email' | 'any'

export interface IValidationSpec {
  [key: string]: Validator | ValidatorType
}
