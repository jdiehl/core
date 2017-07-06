
import { expect } from 'chai'
import { stub } from 'sinon'

import { TemplateService } from '../'
import { mockServices, resetMockServices } from './util'

describe('template', () => {
  let template: TemplateService

  beforeEach(() => {
    resetMockServices()
    template = new TemplateService({} as any, mockServices as any)
  })

  it('should...', () => {
  })

})
