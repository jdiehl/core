import { CoreService } from '../../core-service'

import { IValidationSpec } from '../validation/validation-interface'
import { Model } from './model'

export * from './model'

export class ModelService extends CoreService {
  readonly models: { [key: string]: Model } = {}

  add<M = Model>(name: string, spec?: IValidationSpec, CustomModel: any = Model): M {
    const validator = spec ? this.services.validation.validator(spec) : undefined
    const model = new CustomModel(this.services, name, validator)
    this.models[name] = model
    return model
  }
}
