import { each, equals } from '@didie/utils'

import { CoreService } from '../../core-service'
import { IValidationSpec, Validator, ValidatorType } from './validation-interface'

// tslint:disable-next-line:max-line-length
const EmailRegexp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i

export class ValidationService extends CoreService {
  protected validators: Record<string, Validator> = {
    any: v => true,
    boolean: v => typeof v === 'boolean',
    email: v => EmailRegexp.test(v),
    number: v => typeof v === 'number',
    string: v => typeof v === 'string'
  }

  validate(spec: IValidationSpec, obj: any, allowPartial: boolean = false): boolean {
    if (!allowPartial) {
      const specKeys = Object.keys(spec)
      const objKeys = Object.keys(obj)
      for (const key of specKeys) {
        if (obj[key] === undefined) return false
      }
      if (specKeys.length !== objKeys.length) return false
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
