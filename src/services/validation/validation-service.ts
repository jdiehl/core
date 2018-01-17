import { each, equals } from '@didie/utils'

import { CoreService } from '../../core-service'
import { IValidationSpec, Validate, ValidationMode, Validator, ValidatorType } from './validation-interface'

// tslint:disable-next-line:max-line-length
const EmailRegexp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i

export class ValidationService extends CoreService {
  protected validators: Record<string, Validate> = {
    any: v => true,
    boolean: v => typeof v === 'boolean',
    date: v => v instanceof Date,
    email: v => EmailRegexp.test(v),
    number: v => typeof v === 'number',
    string: v => typeof v === 'string'
  }

  validate(spec: IValidationSpec, obj: any, mode: ValidationMode): boolean {
    return this.validator(spec)(obj, mode)
  }

  validator(spec: IValidationSpec): Validator {
    return (obj: any, mode: ValidationMode) => {
      if (mode === 'update') {
        if (obj._id) return false
      } else if (mode === 'insert') {
        if (!each(spec, (value, key) => obj[key] !== undefined)) return false
      }

      return each(obj, (value, key) => {
        const type = spec[key]
        if (!type) return false
        const validator = typeof type === 'function' ? type : this.validators[type]
        if (!validator) return false
        return validator(value)
      })
    }
  }

}
