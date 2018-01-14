import { CoreService } from '../../core-service'

import { IValidationSpec } from '../validation/validation-interface'
import { Model } from './model'

export * from './model'

export class ModelService extends CoreService {
  private models: { [key: string]: Model } = {}

  add<M = Model>(name: string, spec?: IValidationSpec, CustomModel: any = Model): M {
    const model = new CustomModel(this.services, name, spec)
    this.models[name] = model
    return model
  }

  get<M = Model>(name: string): M {
    return (this.models as any)[name] as M
  }
}
