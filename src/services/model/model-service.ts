import { CoreService } from '../../core-service'

import { IValidationSpec } from '../validation/validation-interface'
import { Model } from './model'

export * from './model'

export class ModelService extends CoreService {
  readonly models: { [key: string]: Model } = {}

  add(name: string, spec: IValidationSpec): Model {
    const validator = this.services.validation.validator(spec)
    const model = new Model(this.services.db, name, validator)
    this.models[name] = model
    return model
  }
}
