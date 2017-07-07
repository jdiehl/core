
import { expect } from 'chai'
import { stub } from 'sinon'

import { TemplateService } from '../'
import { mockServices, resetMockServices } from './util'

describe.only('template', () => {
  let template: TemplateService

  beforeEach(async () => {
    resetMockServices()
    const templates = {
      markdown: 'test/resources/markdown.md',
      mustache: 'test/resources/mustache.mst'
    }
    template = new TemplateService({ template: { templates }} as any, mockServices as any)
    await template.beforeInit()
  })

  it('should render a mustache template', async () => {
    const vars = {
      greeting: 'Hello',
      items: ['a', 'b'],
      person: { first: 'John', last: 'Doe' }
    }
    const res = await template.render('mustache', vars)
    expect(res).to.equal(`Hello John Doe\nDon't forget:\n* a\n* b\n`)
  })

  it('should load and render a mustache template', async () => {
    await template.load('partial', 'test/resources/partial.mst')
    const res = await template.render('partial', { greeting: 'Hi' })
    expect(res).to.equal(`Hi from the partial!\n`)
  })

  it('should load and render a mustache partial', async () => {
    await template.load('partial', 'test/resources/partial.mst')
    const vars = {
      greeting: 'Hello',
      items: ['x'],
      person: { first: 'Tom', last: 'Smith' }
    }
    const res = await template.render('mustache', vars)
    expect(res).to.equal(`Hello Tom Smith\nDon't forget:\n* x\nHello from the partial!\n`)
  })

  it('should render a markdown template', async () => {
    const vars = {
      items: ['a', 'b'],
      person: { first: 'John', last: 'Doe' }
    }
    const res = await template.render('markdown', vars)
    expect(res).to.equal(`<h1>Hello John Doe</h1>
<p><strong>Don't forget:</strong></p>
<ul>\n<li>a</li>\n<li>b</li>\n</ul>\n`)
  })

  it('should render a markdown template with a partial', async () => {
    await template.load('partial', 'test/resources/partial.mst')
    const vars = {
      greeting: 'Howdy',
      items: ['x', 'y'],
      person: { first: 'Tom', last: 'Smith' }
    }
    const res = await template.render('markdown', vars)
    expect(res).to.equal(`<h1>Hello Tom Smith</h1>
<p><strong>Don't forget:</strong></p>
<ul>\n<li>x</li>\n<li>y</li>\n</ul>
<p>Howdy from the partial!</p>\n`)
  })

})
